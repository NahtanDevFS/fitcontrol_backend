//ejercicio_musculo.controller.ts
import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

export const getAllEjerciciosMusculos = async (
  _req: Request,
  res: Response
) => {
  try {
    const { data, error } = await supabase
      .from("ejercicio_musculo")
      .select("*");

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error(
      "Error trayendo la relación de musculos y ejercicios:",
      error
    );
    res.status(500).json({
      error: "Error al obtener la relación de musculos y ejercicios",
      details: error,
    });
  }
};
