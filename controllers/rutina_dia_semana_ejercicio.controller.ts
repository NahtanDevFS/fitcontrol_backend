import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

//obtener rutina de usuario filtrando por id_rutina_dia_semana
export const getRutinaDiaEjerciciosUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("rutina_dia_semana_ejercicio")
      .select("*")
      .eq("id_rutina_dia_semana", id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener ejercicios de la rutina del día:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearRutinaDiaEjercicio = async (req: Request, res: Response) => {
  try {
    const {
      id_rutina_dia_semana,
      id_ejercicio,
      repeticiones,
      series,
      peso_ejercicio,
    } = req.body;

    // Validación básica
    if (!id_rutina_dia_semana || !id_ejercicio || !repeticiones || !series) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    const { data, error } = await supabase
      .from("rutina_dia_semana_ejercicio")
      .insert([
        {
          id_rutina_dia_semana,
          id_ejercicio,
          repeticiones,
          series,
          peso_ejercicio,
        },
      ])
      .select()
      .single(); // Para obtener el objeto recién creado

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error al crear ejercicios de la rutina del día:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarRutinaDiaEjercicio = async (
  req: Request,
  res: Response
) => {
  try {
    const id_rutina_dia_semana_ejercicio = req.params.id;
    const {
      id_rutina_dia_semana,
      id_ejercicio,
      repeticiones,
      series,
      peso_ejercicio,
    } = req.body;

    // Validar que la rutina existe
    const { data: rutinaDiaEjercicioExistente, error: errorExistente } =
      await supabase
        .from("rutina_dia_semana_ejercicio")
        .select("id_rutina_dia_semana_ejercicio")
        .eq("id_rutina_dia_semana_ejercicio", id_rutina_dia_semana_ejercicio)
        .single();

    if (errorExistente || !rutinaDiaEjercicioExistente) {
      return res
        .status(404)
        .json({ error: "Ejericicio de rutina del día no encontrada" });
    }

    // Campos a actualizar
    const updates: Record<string, any> = {};
    if (id_rutina_dia_semana)
      updates.id_rutina_dia_semana = id_rutina_dia_semana;
    if (id_ejercicio) updates.id_ejercicio = id_ejercicio;
    if (repeticiones) updates.repeticiones = repeticiones;
    if (series) updates.series = series;
    if (peso_ejercicio) updates.peso_ejercicio = peso_ejercicio;

    // Si no hay campos válidos para actualizar
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos válidos para actualizar" });
    }

    const { data, error } = await supabase
      .from("rutina_dia_semana_ejercicio")
      .update(updates)
      .eq("id_rutina_dia_semana_ejercicio", id_rutina_dia_semana_ejercicio)
      .select("id_rutina_dia_semana, id_ejercicio");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error al actualizar ejercicio de la rutina:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

//eliminar un día de esa rutina
export const eliminarRutinaDiaEjercicio = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Verificar existencia
    const { error: verifyError } = await supabase
      .from("rutina_dia_semana_ejercicio")
      .select("id_rutina_dia_semana_ejercicio")
      .eq("id_rutina_dia_semana_ejercicio", id)
      .single();

    if (verifyError) {
      return res
        .status(404)
        .json({ error: "Ejercicio de la rutina del día no encontrada" });
    }

    // Eliminación
    const { error } = await supabase
      .from("rutina_dia_semana_ejercicio")
      .delete()
      .eq("id_rutina_dia_semana_ejercicio", id);

    if (error) {
      return res.status(400).json({
        error: "Error al eliminar",
        detalles: error.message,
      });
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error(
      "Error al eliminar el ejercicio de la rutina del día:",
      error
    );
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
