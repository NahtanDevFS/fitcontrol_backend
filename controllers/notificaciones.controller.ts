import { Request, Response } from "express";
import { sendEmail } from "../services/emailService";
import { supabase } from "../libs/supabaseClient";

export const enviarNotificacionRacha = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Se requiere el ID del usuario." });
    }

    const { data: userData, error: userError } = await supabase
      .from("usuario")
      .select("correo_usuario, nombre_usuario")
      .eq("id_usuario", userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const emailResult = await sendEmail({
      to: userData.correo_usuario,
      subject: "🔥 ¡Tu racha de hoy te espera en FitControl!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Hola ${userData.nombre_usuario},</h2>
          <p>Tu registro diario de racha ya está disponible en FitControl.</p>
          <p>No olvides completar tu rutina y tu dieta de hoy para mantener tu racha. ¡Vamos con todo!</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="background-color: #ffc70e; color: #333; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Ir a mi Dashboard
          </a>
          <p>¡Sigue así!</p>
          <p><strong>El equipo de FitControl</strong></p>
        </div>
      `,
    });

    if (emailResult.success) {
      res
        .status(200)
        .json({ success: true, message: "Notificación por correo enviada." });
    } else {
      throw emailResult.error;
    }
  } catch (error: any) {
    console.error("Error al enviar notificación por correo:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};
