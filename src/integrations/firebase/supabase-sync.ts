import { User as FirebaseUser } from "firebase/auth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sincroniza un usuario de Firebase con Supabase
 * Crea o actualiza el perfil del usuario en Supabase
 * Para usuarios nuevos, crea el perfil sin usuario de Supabase Auth (se creará después del diagnóstico)
 */
export async function syncFirebaseUserToSupabase(firebaseUser: FirebaseUser) {
  try {
    if (!firebaseUser.email) {
      throw new Error("El usuario de Firebase no tiene email");
    }

    console.log("Sincronizando usuario de Firebase:", firebaseUser.email);

    // Preparar datos del perfil
    const profileData = {
      full_name:
        firebaseUser.displayName ||
        firebaseUser.email?.split("@")[0] ||
        "Usuario",
      avatar_url: firebaseUser.photoURL || null,
    };

    // Primero, intentar crear o obtener el usuario en Supabase Auth
    // Generar una contraseña aleatoria segura
    const randomPassword =
      Math.random().toString(36).slice(-12) +
      Math.random().toString(36).slice(-12).toUpperCase() +
      "!@#123";

    let supabaseUserId: string;
    let isNewSupabaseUser = false;

    // Intentar crear usuario en Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: firebaseUser.email,
      password: randomPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: profileData.full_name,
          provider: "google",
          firebase_uid: firebaseUser.uid,
        },
      },
    });

    if (signUpError) {
      // Si el usuario ya existe en Supabase Auth
      if (
        signUpError.message.includes("already registered") ||
        signUpError.message.includes("already exists") ||
        signUpError.message.includes("User already registered")
      ) {
        console.log(
          "Usuario ya existe en Supabase Auth, intentando iniciar sesión..."
        );

        // El usuario ya existe, intentar iniciar sesión usando magic link o password reset
        // Como no tenemos la contraseña, intentamos usar resetPasswordForEmail
        // que enviará un email, pero mejor aún: intentamos buscar el perfil directamente

        // Primero, intentar obtener el usuario actual (si hay sesión)
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (currentUser && currentUser.email === firebaseUser.email) {
          supabaseUserId = currentUser.id;
          console.log("Usuario encontrado en sesión:", supabaseUserId);
        } else {
          // No hay sesión activa. El usuario ya existe en Supabase Auth
          // Intentar buscar el perfil usando el email desde auth.users
          console.log(
            "Usuario existe en Supabase Auth pero sin sesión activa, buscando perfil..."
          );

          // Intentar buscar el usuario en auth.users usando una función RPC o directamente
          // Como alternativa, intentamos usar signInWithPassword con una contraseña temporal
          // Pero mejor aún: buscar el perfil usando el email desde una función de base de datos

          // Por ahora, intentamos buscar el perfil usando una query directa
          // Nota: Esto requiere que tengamos acceso a auth.users, lo cual no es posible directamente
          // Entonces, simplemente permitimos continuar con Firebase

          // Guardar información de Firebase para uso posterior
          localStorage.setItem(
            "firebase_user",
            JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              authenticated: true,
            })
          );

          // Intentar buscar el perfil usando una función RPC de Supabase
          // Si no existe, creamos una función que busque por email
          try {
            const { data: profileData, error: profileError } = await (
              supabase.rpc as any
            )("get_profile_by_email", { user_email: firebaseUser.email });

            if (!profileError && profileData) {
              // Encontramos el perfil, actualizar con información de Firebase
              const profile = profileData as any;
              const { data: updatedProfile, error: updateError } =
                await supabase
                  .from("profiles")
                  .update({
                    full_name: firebaseUser.displayName || profile.full_name,
                    avatar_url: firebaseUser.photoURL || profile.avatar_url,
                  })
                  .eq("id", profile.id)
                  .select()
                  .single();

              if (!updateError && updatedProfile) {
                return {
                  success: true,
                  userId: updatedProfile.id,
                  profile: updatedProfile,
                  isNewUser: false,
                };
              }
            }
          } catch (rpcError) {
            console.log(
              "Función RPC no disponible, continuando con Firebase..."
            );
          }

          // Si no podemos buscar el perfil, retornar éxito y permitir continuar con Firebase
          // El perfil se actualizará cuando el usuario inicie sesión normalmente
          return {
            success: true,
            userId: null, // Se establecerá cuando haya sesión
            profile: {
              email: firebaseUser.email,
              full_name:
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                "Usuario",
              avatar_url: firebaseUser.photoURL || null,
              business_stage: "pendiente",
              assigned_route: null,
              current_month: 1,
            } as any,
            isNewUser: false,
            usingFirebaseAuth: true, // Indica que está usando Firebase como autenticación principal
          };
        }
      } else {
        console.error("Error creando usuario en Supabase Auth:", signUpError);
        throw signUpError;
      }
    } else {
      if (!authData.user) {
        throw new Error("No se pudo crear el usuario en Supabase");
      }
      supabaseUserId = authData.user.id;
      isNewSupabaseUser = true;
      console.log("Usuario creado en Supabase Auth:", supabaseUserId);
    }

    // Guardar información de Firebase
    localStorage.setItem(
      "firebase_user",
      JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      })
    );

    // Verificar si el perfil ya existe por ID
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUserId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error buscando perfil:", fetchError);
      throw fetchError;
    }

    if (existingProfile) {
      console.log("Perfil existente encontrado:", existingProfile.id);

      // Actualizar perfil existente
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
        })
        .eq("id", supabaseUserId);

      if (updateError) {
        console.error("Error actualizando perfil:", updateError);
        throw updateError;
      }

      return {
        success: true,
        userId: existingProfile.id,
        profile: { ...existingProfile, ...profileData },
        isNewUser: false,
      };
    } else {
      console.log("Creando nuevo perfil...");

      // El trigger de Supabase debería haber creado el perfil automáticamente
      // Esperar un momento y verificar si existe
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verificar nuevamente si el perfil fue creado por el trigger
      const { data: triggerProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUserId)
        .maybeSingle();

      if (triggerProfile) {
        console.log("Perfil creado por trigger, actualizando...");
        // Actualizar con los datos de Firebase
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            business_stage: "pendiente",
          })
          .eq("id", supabaseUserId);

        if (updateError) {
          console.error("Error actualizando perfil del trigger:", updateError);
          throw updateError;
        }

        return {
          success: true,
          userId: supabaseUserId,
          profile: {
            ...triggerProfile,
            ...profileData,
            business_stage: "pendiente",
          },
          isNewUser: true,
        };
      }

      // Si el trigger no creó el perfil, crearlo manualmente
      console.log("Creando perfil manualmente...");
      const { error: insertError } = await supabase.from("profiles").insert({
        id: supabaseUserId,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        age: 18, // Valor por defecto, se actualizará en el diagnóstico
        city: "La Paz", // Valor por defecto, se actualizará en el diagnóstico
        business_sector: "General", // Valor por defecto, se actualizará en el diagnóstico
        business_stage: "pendiente",
        assigned_route: null,
        current_month: 1,
      });

      if (insertError) {
        // Si el error es que ya existe, intentar obtenerlo
        if (
          insertError.code === "23505" ||
          insertError.message.includes("duplicate")
        ) {
          console.log("Perfil ya existe, obteniendo...");
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", supabaseUserId)
            .single();

          if (existingProfile) {
            return {
              success: true,
              userId: supabaseUserId,
              profile: existingProfile,
              isNewUser: true,
            };
          }
        }
        console.error("Error insertando perfil:", insertError);
        throw insertError;
      }

      console.log("Perfil creado exitosamente");

      return {
        success: true,
        userId: supabaseUserId,
        profile: {
          id: supabaseUserId,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          age: 18,
          city: "La Paz",
          business_sector: "General",
          business_stage: "pendiente",
          assigned_route: null,
          current_month: 1,
        },
        isNewUser: true,
      };
    }
  } catch (error: any) {
    console.error("Error syncing Firebase user to Supabase:", error);
    throw error;
  }
}
