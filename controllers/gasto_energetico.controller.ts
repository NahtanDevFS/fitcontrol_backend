import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

export const getGastoEnergetico = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("gasto_energetico")
      .select("*")
      .eq("id_usuario", id)
      .maybeSingle();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error("Error al obtener gasto energético:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};

//Crear o actualizar (upsert)
export const upsertGastoEnergetico = async (req: Request, res: Response) => {
  try {
    const { id_usuario, sexo, edad, altura_cm, peso_kg, nivel_actividad } =
      req.body;

    if (
      !id_usuario ||
      !sexo ||
      !edad ||
      !altura_cm ||
      !peso_kg ||
      !nivel_actividad
    ) {
      return res
        .status(400)
        .json({ error: "Todos los campos son requeridos." });
    }

    let tmb = 0;
    if (sexo === "hombre") {
      tmb = 10 * peso_kg + 6.25 * altura_cm - 5 * edad + 5;
    } else {
      tmb = 10 * peso_kg + 6.25 * altura_cm - 5 * edad - 161;
    }
    tmb = Math.round(tmb);

    const calorias_mantener = Math.round(tmb * nivel_actividad);
    const calorias_deficit = Math.round(calorias_mantener * 0.85);
    const calorias_superavit = Math.round(calorias_mantener * 1.15);

    let peso_ideal_kg = 0;
    if (altura_cm > 152.4) {
      if (sexo === "hombre") {
        peso_ideal_kg = 50 + 2.3 * ((altura_cm - 152.4) / 2.54);
      } else {
        peso_ideal_kg = 45.5 + 2.3 * ((altura_cm - 152.4) / 2.54);
      }
    }

    const dataToUpsert = {
      id_usuario,
      sexo,
      edad,
      altura_cm,
      peso_kg,
      nivel_actividad,
      tmb,
      calorias_mantener,
      calorias_deficit,
      calorias_superavit,
      peso_ideal_kg,
    };

    const { data, error } = await supabase
      .from("gasto_energetico")
      .upsert(dataToUpsert, { onConflict: "id_usuario" })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error al guardar gasto energético:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};
