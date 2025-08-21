//rutina.controller.ts
import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

export const getRutinaUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id del usuario

    // Consulta anidada para traer todo de una vez
    const { data, error } = await supabase
      .from("rutina")
      .select(
        `
        id_rutina,
        nombre_rutina,
        fecha_creacion_rutina,
        rutina_dia_semana (
          id_rutina_dia_semana,
          dia_semana,
          rutina_dia_semana_ejercicio (
            id_rutina_dia_semana_ejercicio,
            repeticiones,
            series,
            peso_ejercicio,
            ejercicio (
              id_ejercicio,
              nombre_ejercicio
            )
          )
        )
      `
      )
      .eq("id_usuario", id);

    if (error) {
      console.error("Error de Supabase:", error);
      return res.status(500).json({ error: error.message });
    }

    // Cambiamos los nombres de las tablas anidadas para que coincidan con los tipos del frontend
    const rutinasFormateadas = data.map((rutina) => ({
      ...rutina,
      dias: rutina.rutina_dia_semana.map((dia) => ({
        ...dia,
        ejercicios: dia.rutina_dia_semana_ejercicio,
      })),
    }));

    res.json(rutinasFormateadas);
  } catch (error) {
    console.error("Error al obtener la rutina completa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearRutina = async (req: Request, res: Response) => {
  try {
    const { id_usuario, nombre_rutina } = req.body;

    // Validación básica
    if (!id_usuario || !nombre_rutina) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    const { data, error } = await supabase
      .from("rutina")
      .insert([
        {
          id_usuario,
          nombre_rutina,
        },
      ])
      .select("id_rutina")
      .single(); // Para obtener el objeto recién creado

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error al crear la rutina:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarRutina = async (req: Request, res: Response) => {
  try {
    const id_rutina = req.params.id;
    const { nombre_rutina, estado } = req.body;

    // Validar que el usuario existe
    const { data: rutinaExistente, error: errorExistente } = await supabase
      .from("rutina")
      .select("id_rutina")
      .eq("id_rutina", id_rutina)
      .single();

    if (errorExistente || !rutinaExistente) {
      return res.status(404).json({ error: "Rutina no encontrada" });
    }

    // Campos a actualizar
    const updates: Record<string, any> = {};
    if (nombre_rutina) updates.nombre_rutina = nombre_rutina;
    if (estado !== undefined) updates.estado = parseInt(estado);

    // Si no hay campos válidos para actualizar
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos válidos para actualizar" });
    }

    const { data, error } = await supabase
      .from("rutina")
      .update(updates)
      .eq("id_rutina", id_rutina)
      .select("id_usuario, nombre_rutina, estado");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error al actualizar rutina:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
