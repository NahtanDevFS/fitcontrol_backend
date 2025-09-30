//rutina_dia_semana.controller.ts
import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

export const getRutinaDiaUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("rutina_dia_semana")
      .select("*")
      .eq("id_rutina", id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener rutina del día:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearRutinaDia = async (req: Request, res: Response) => {
  try {
    const { id_rutina, dia_semana } = req.body;

    //Validación básica
    if (!id_rutina || !dia_semana) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    const { data, error } = await supabase
      .from("rutina_dia_semana")
      .insert([
        {
          id_rutina,
          dia_semana,
        },
      ])
      .select()
      .single(); //Para obtener el objeto recién creado

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error al crear la rutina del día:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarRutinaDia = async (req: Request, res: Response) => {
  try {
    const id_rutina_dia_semana = req.params.id;
    const { dia_semana } = req.body;

    //Validar que la rutina existe
    const { data: rutinaDiaExistente, error: errorExistente } = await supabase
      .from("rutina_dia_semana")
      .select("id_rutina_dia_semana")
      .eq("id_rutina_dia_semana", id_rutina_dia_semana)
      .single();

    if (errorExistente || !rutinaDiaExistente) {
      return res.status(404).json({ error: "Rutina del día no encontrada" });
    }

    //Campos a actualizar
    const updates: Record<string, any> = {};
    if (dia_semana) updates.dia_semana = dia_semana;

    //Si no hay campos válidos para actualizar
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos válidos para actualizar" });
    }

    const { data, error } = await supabase
      .from("rutina_dia_semana")
      .update(updates)
      .eq("id_rutina_dia_semana", id_rutina_dia_semana)
      .select("id_rutina, dia_semana");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error al actualizar rutina:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

//eliminar un día de esa rutina
export const eliminarRutinaDia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //Verificar existencia
    const { error: verifyError } = await supabase
      .from("rutina_dia_semana")
      .select("id_rutina_dia_semana")
      .eq("id_rutina_dia_semana", id)
      .single();

    if (verifyError) {
      return res.status(404).json({ error: "Rutina del día no encontrada" });
    }

    //Eliminación
    const { error } = await supabase
      .from("rutina_dia_semana")
      .delete()
      .eq("id_rutina_dia_semana", id);

    if (error) {
      return res.status(400).json({
        error: "Error al eliminar",
        detalles: error.message,
      });
    }

    res.status(204).send(); //204 No Content
  } catch (error) {
    console.error("Error al eliminar rutina del día:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
