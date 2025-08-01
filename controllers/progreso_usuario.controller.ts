import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

// Obtener progreso de usuario filtrando por id_usuario
export const getProgresoUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("progreso_usuario")
      .select("*")
      .eq("id_usuario", id)
      .order("fecha_inicio_proceso", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener el progreso del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear un nuevo registro de progreso
export const crearProgresoUsuario = async (req: Request, res: Response) => {
  try {
    const {
      id_usuario,
      fecha_inicio_proceso,
      fecha_final_proceso,
      peso_actual,
      peso_deseado,
      objetivo,
      estado,
    } = req.body;

    // Validación
    if (!id_usuario || !peso_actual || !peso_deseado || !objetivo) {
      return res.status(400).json({
        error:
          "Los campos id_usuario, peso_actual, peso_deseado y objetivo son obligatorios",
      });
    }

    const { data, error } = await supabase
      .from("progreso_usuario")
      .insert([
        {
          id_usuario,
          fecha_inicio_proceso,
          fecha_final_proceso: fecha_final_proceso || null,
          peso_actual,
          peso_deseado,
          objetivo,
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
    console.error("Error al crear registro de progreso:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar un registro de progreso
export const actualizarProgresoUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const id_progreso = req.params.id;
    const {
      fecha_inicio_proceso,
      fecha_final_proceso,
      peso_actual,
      peso_deseado,
      objetivo,
      estado,
    } = req.body;

    // Validar que el registro existe
    const { data: progresoExistente, error: errorExistente } = await supabase
      .from("progreso_usuario")
      .select("id_progreso")
      .eq("id_progreso", id_progreso)
      .single();

    if (errorExistente || !progresoExistente) {
      return res
        .status(404)
        .json({ error: "Registro de progreso no encontrado" });
    }

    // Campos a actualizar
    const updates: Record<string, any> = {};
    if (fecha_inicio_proceso)
      updates.fecha_inicio_proceso = fecha_inicio_proceso;
    if (fecha_final_proceso) updates.fecha_final_proceso = fecha_final_proceso;
    if (peso_actual) updates.peso_actual = peso_actual;
    if (peso_deseado) updates.peso_deseado = peso_deseado;
    if (objetivo) updates.objetivo = objetivo;
    if (estado !== undefined) updates.estado = estado;

    // Si no hay campos válidos para actualizar
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos válidos para actualizar" });
    }

    const { data, error } = await supabase
      .from("progreso_usuario")
      .update(updates)
      .eq("id_progreso", id_progreso)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error al actualizar progreso del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un registro de progreso
export const eliminarProgresoUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar existencia
    const { error: verifyError } = await supabase
      .from("progreso_usuario")
      .select("id_progreso")
      .eq("id_progreso", id)
      .single();

    if (verifyError) {
      return res
        .status(404)
        .json({ error: "Registro de progreso no encontrado" });
    }

    // Eliminación
    const { error } = await supabase
      .from("progreso_usuario")
      .delete()
      .eq("id_progreso", id);

    if (error) {
      return res.status(400).json({
        error: "Error al eliminar",
        detalles: error.message,
      });
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error("Error al eliminar el registro de progreso:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
