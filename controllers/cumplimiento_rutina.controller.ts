import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

//Actualizar un registro de cumplimiento
export const actualizarCumplimientoRutina = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params; //id_cumplimiento_rutina
    const { cumplido } = req.body;

    if (cumplido === undefined) {
      return res
        .status(400)
        .json({ error: "El campo 'cumplido' es requerido." });
    }

    const { data, error } = await supabase
      .from("cumplimiento_rutina")
      .update({ cumplido })
      .eq("id_cumplimiento_rutina", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error al actualizar cumplimiento de rutina:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};
