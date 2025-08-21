//cumplimiento_rutina.controller.ts
import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

// Obtener registros de cumplimiento filtrando por id_rutina_dia_semana
export const getCumplimientosRutina = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("cumplimiento_rutina")
      .select("*")
      .eq("id_rutina_dia_semana", id)
      .order("fecha_a_cumplir", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener los cumplimientos de rutina:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear un nuevo registro de cumplimiento
export const crearCumplimientoRutina = async (req: Request, res: Response) => {
  try {
    const { id_rutina_dia_semana, fecha_a_cumplir, cumplido } = req.body;

    // Validación básica
    if (!id_rutina_dia_semana || !fecha_a_cumplir) {
      return res.status(400).json({
        error:
          "Los campos id_rutina_dia_semana y fecha_a_cumplir son obligatorios",
      });
    }

    const { data, error } = await supabase
      .from("cumplimiento_rutina")
      .insert([
        {
          id_rutina_dia_semana,
          fecha_a_cumplir,
          cumplido: cumplido || false, // Valor por defecto si no se proporciona
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error al crear registro de cumplimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar un registro de cumplimiento
export const actualizarCumplimientoRutina = async (
  req: Request,
  res: Response
) => {
  try {
    const id_cumplimiento_rutina = req.params.id;
    const { id_rutina_dia_semana, fecha_a_cumplir, cumplido } = req.body;

    // Validar que el registro existe
    const { data: cumplimientoExistente, error: errorExistente } =
      await supabase
        .from("cumplimiento_rutina")
        .select("id_cumplimiento_rutina")
        .eq("id_cumplimiento_rutina", id_cumplimiento_rutina)
        .single();

    if (errorExistente || !cumplimientoExistente) {
      return res
        .status(404)
        .json({ error: "Registro de cumplimiento no encontrado" });
    }

    // Campos a actualizar
    const updates: Record<string, any> = {};
    if (id_rutina_dia_semana)
      updates.id_rutina_dia_semana = id_rutina_dia_semana;
    if (fecha_a_cumplir) updates.fecha_a_cumplir = fecha_a_cumplir;
    if (cumplido !== undefined) updates.cumplido = cumplido;

    // Si no hay campos válidos para actualizar
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos válidos para actualizar" });
    }

    const { data, error } = await supabase
      .from("cumplimiento_rutina")
      .update(updates)
      .eq("id_cumplimiento_rutina", id_cumplimiento_rutina)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error al actualizar cumplimiento de rutina:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un registro de cumplimiento
export const eliminarCumplimientoRutina = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Verificar existencia
    const { error: verifyError } = await supabase
      .from("cumplimiento_rutina")
      .select("id_cumplimiento_rutina")
      .eq("id_cumplimiento_rutina", id)
      .single();

    if (verifyError) {
      return res
        .status(404)
        .json({ error: "Registro de cumplimiento no encontrado" });
    }

    // Eliminación
    const { error } = await supabase
      .from("cumplimiento_rutina")
      .delete()
      .eq("id_cumplimiento_rutina", id);

    if (error) {
      return res.status(400).json({
        error: "Error al eliminar",
        detalles: error.message,
      });
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error("Error al eliminar el registro de cumplimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener cumplimientos por fecha específica
export const getCumplimientosPorFecha = async (req: Request, res: Response) => {
  try {
    const { fecha } = req.params;
    const { data, error } = await supabase
      .from("cumplimiento_rutina")
      .select("*")
      .eq("fecha_a_cumplir", fecha);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener cumplimientos por fecha:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
