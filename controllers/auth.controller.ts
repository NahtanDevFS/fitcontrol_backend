//auth.controller.ts
import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";
import { User } from "@supabase/supabase-js";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

//Registrar nuevo usuario
export const registrarUsuario = async (req: Request, res: Response) => {
  try {
    const { email, password, nombre_usuario } = req.body;

    //Validación básica
    if (!email || !password || !nombre_usuario) {
      return res.status(400).json({
        error: "Email, contraseña y nombre de usuario son requeridos",
      });
    }
    //Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/confirmation`, //URL de confirmacion
        data: {
          nombre_usuario,
        },
      },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user?.id;

    if (!userId) {
      return res.status(500).json({ error: "Error al obtener ID de usuario" });
    }

    //Crear registro en tabla usuario (sin contraseña)
    const { data: userData, error: userError } = await supabase
      .from("usuario")
      .insert([
        {
          id_usuario: userId,
          nombre_usuario,
          correo_usuario: email,
          fecha_creacion: new Date().toISOString().split("T")[0],
          estado: 0, // 0 = pendiente de verificación
        },
      ])
      .select()
      .single();

    if (userError) {
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({ error: userError.message });
    }

    //Respuesta exitosa indicando que se requiere verificación
    res.status(201).json({
      success: true,
      message: "Registro exitoso. Por favor verifica tu correo electrónico.",
      user: {
        id: userData.id_usuario,
        email: userData.correo_usuario,
        nombre: userData.nombre_usuario,
        estado: userData.estado,
      },
    });
  } catch (error) {
    console.error("Error en registro de usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

//Autenticar usuario (no es necesario verificar con bcrypt, supabase ya lo hace con authetication)
export const autenticarUsuario = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email y contraseña son requeridos",
      });
    }

    //Autenticar con Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    const { data: userData, error: userError } = await supabase
      .from("usuario")
      .select("*")
      .eq("correo_usuario", email)
      .single();

    //Obtener datos adicionales del usuario desde tu tabla
    //Si hay un error en la BD o si no se encuentra el usuario, se cierra la sesión y se devuelve un error.
    if (userError || !userData) {
      await supabase.auth.signOut();
      return res.status(404).json({
        error: "Perfil de usuario no encontrado o datos inconsistentes.",
      });
    }

    if (userData.estado !== 1) {
      await supabase.auth.signOut();
      return res
        .status(403)
        .json({ error: "Usuario no activo o pendiente de verificación" });
    }

    res.json({
      message: "Autenticación exitosa",
      user: {
        id: userData.id_usuario,
        nombre: userData.nombre_usuario,
        email: userData.correo_usuario,
        fecha_creacion: userData.fecha_creacion,
      },
      session: authData.session,
    });
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

//Cerrar sesión
export const cerrarSesion = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

//Obtener usuario actual
// export const obtenerUsuarioActual = async (req: Request, res: Response) => {
//   try {
//     //Verificar sesión
//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser();

//     if (authError || !user) {
//       return res.status(401).json({ error: "No autenticado" });
//     }

//     //Obtener información adicional del usuario
//     const { data: userData, error: userError } = await supabase
//       .from("usuario")
//       .select("*")
//       .eq("id_usuario", user.id)
//       .single();

//     if (userError) {
//       return res.status(404).json({ error: "Perfil de usuario no encontrado" });
//     }

//     res.json(userData);
//   } catch (error) {
//     console.error("Error al obtener usuario:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

//Middleware de autenticación
// export const autenticarMiddleware = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: Function
// ) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ error: "No autorizado: Falta el token." });
//     }
//     const jwt = authHeader.split(" ")[1];
//     const {
//       data: { user },
//       error,
//     } = await supabase.auth.getUser(jwt);

//     if (error || !user) {
//       return res.status(401).json({ error: "No autorizado: Token inválido." });
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("Error en middleware de autenticación:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

//solicitar reset contraseña
export const solicitarReseteoPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "El correo es requerido." });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    //Esta es la URL a la que llegará el usuario desde su correo
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
  });

  if (error) {
    console.error("Error al enviar email de reseteo:", error);
    //No revelamos si el email existe o no por seguridad
    return res.status(200).json({
      message:
        "Si existe una cuenta con este correo, se ha enviado un enlace para resetear la contraseña.",
    });
  }

  return res.status(200).json({
    message:
      "Si existe una cuenta con este correo, se ha enviado un enlace para resetear la contraseña.",
  });
};

//actualizar contraseña de usuario
export const actualizarPasswordUsuario = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { password, access_token, refresh_token } = req.body;

  if (!password || !access_token || !refresh_token) {
    return res
      .status(400)
      .json({ error: "Faltan datos para la actualización." });
  }

  try {
    //Establecemos la sesión en el cliente de Supabase del backend.
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (sessionError) throw sessionError;

    //Ahora que el cliente está autenticado, actualizamos al usuario.
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) throw updateError;

    //Cerramos la sesión por seguridad.
    await supabase.auth.signOut();

    return res
      .status(200)
      .json({ message: "Contraseña actualizada exitosamente." });
  } catch (error: any) {
    console.error("Error al actualizar la contraseña:", error);
    return res.status(500).json({
      error: "No se pudo actualizar la contraseña.",
      details: error.message,
    });
  }
};
