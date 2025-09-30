//ejercicio.controller.ts
import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

export const getAllEjercicios = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("ejercicio").select("*");

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Error trayendo los ejercicios:", error);
    res.status(500).json({
      error: "Error al obtener los ejercicios",
      details: error,
    });
  }
};

export const getEjerciciosByMusculo = async (req: Request, res: Response) => {
  const { id_musculo } = req.params;

  try {
    //Consulta para traer ejercicios que pertenecen a un músculo específico
    const { data, error } = await supabase
      .from("ejercicio_musculo")
      .select(
        `
        ejercicio (
          id_ejercicio,
          nombre_ejercicio,
          descripcion_ejercicio
        )
      `
      )
      .eq("id_musculo", id_musculo);

    if (error) throw error;

    // La consulta devuelve un arreglo de objetos { ejercicio: { ... } }, así que lo aplano
    const ejercicios = data.map((item) => item.ejercicio);
    res.json({ success: true, data: ejercicios });
  } catch (error) {
    console.error("Error trayendo los ejercicios por músculo:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener los ejercicios" });
  }
};
