import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

// Obtener dietas de un usuario filtrando por id_usuario
export const getDietasUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("dieta")
      .select("*")
      .eq("id_usuario", id)
      .order("fecha_creacion_dieta", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener las dietas del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener una dieta específica por su ID
export const getDietaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("dieta")
      .select("*")
      .eq("id_dieta", id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Dieta no encontrada" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener la dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear una nueva dieta
export const crearDieta = async (req: Request, res: Response) => {
  try {
    const { id_usuario, nombre_dieta, fecha_creacion_dieta, estado } = req.body;

    // Validación básica
    if (!id_usuario || !nombre_dieta) {
      return res.status(400).json({
        error: "Los campos id_usuario y nombre_dieta son obligatorios",
      });
    }

    const { data, error } = await supabase
      .from("dieta")
      .insert([
        {
          id_usuario,
          nombre_dieta,
          fecha_creacion_dieta, //new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
          estado: estado || 1, // Valor por defecto si no se proporciona
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error al crear dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar una dieta existente
export const actualizarDieta = async (req: Request, res: Response) => {
  try {
    const id_dieta = req.params.id;
    const { nombre_dieta, estado } = req.body;

    // Validar que la dieta existe
    const { data: dietaExistente, error: errorExistente } = await supabase
      .from("dieta")
      .select("id_dieta")
      .eq("id_dieta", id_dieta)
      .single();

    if (errorExistente || !dietaExistente) {
      return res.status(404).json({ error: "Dieta no encontrada" });
    }

    // Campos a actualizar
    const updates: Record<string, any> = {};
    if (nombre_dieta) updates.nombre_dieta = nombre_dieta;
    if (estado !== undefined) updates.estado = estado;

    // Si no hay campos válidos para actualizar
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos válidos para actualizar" });
    }

    const { data, error } = await supabase
      .from("dieta")
      .update(updates)
      .eq("id_dieta", id_dieta)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error al actualizar dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Cambiar el estado de una dieta
export const cambiarEstadoDieta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (estado === undefined) {
      return res.status(400).json({ error: "El campo estado es requerido" });
    }

    const { data, error } = await supabase
      .from("dieta")
      .update({ estado })
      .eq("id_dieta", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error al cambiar estado de la dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar una dieta
export const eliminarDieta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar existencia
    const { error: verifyError } = await supabase
      .from("dieta")
      .select("id_dieta")
      .eq("id_dieta", id)
      .single();

    if (verifyError) {
      return res.status(404).json({ error: "Dieta no encontrada" });
    }

    // Eliminación
    const { error } = await supabase.from("dieta").delete().eq("id_dieta", id);

    if (error) {
      return res.status(400).json({
        error: "Error al eliminar",
        detalles: error.message,
      });
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error("Error al eliminar la dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
