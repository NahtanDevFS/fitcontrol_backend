import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

export const getAllUsuarios = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("usuario")
      .select("*")
      .order("fecha_creacion", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarUsuario = async (req: Request, res: Response) => {
  try {
    const id_usuario = req.params.id;
    const {
      nombre_usuario,
      correo_usuario,
      contrasena_usuario,
      estado,
      unidad_peso,
    } = req.body;

    //Validar que el usuario existe
    const { data: usuarioExistente, error: errorExistente } = await supabase
      .from("usuario")
      .select("id_usuario")
      .eq("id_usuario", id_usuario)
      .single();

    if (errorExistente || !usuarioExistente) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Campos a actualizar
    const updates: Record<string, any> = {};
    if (nombre_usuario) updates.nombre_usuario = nombre_usuario;
    if (correo_usuario) updates.correo_usuario = correo_usuario;
    if (contrasena_usuario) updates.contrasena_usuario = contrasena_usuario;
    if (estado !== undefined) updates.estado = parseInt(estado);
    if (unidad_peso) updates.unidad_peso = unidad_peso;

    // Si no hay campos válidos para actualizar
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos válidos para actualizar" });
    }

    const { data, error } = await supabase
      .from("usuario")
      .update(updates)
      .eq("id_usuario", id_usuario)
      .select(
        "id_usuario, nombre_usuario, correo_usuario, fecha_creacion, estado, unidad_peso"
      );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
