import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

//Actualizar el estado de cumplimiento de un día
export const actualizarCumplimientoDia = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params; //Este será el id_cumplimiento_dieta_dia
    const { cumplido } = req.body;

    if (cumplido === undefined) {
      return res
        .status(400)
        .json({ error: "El campo 'cumplido' es requerido." });
    }

    const { data, error } = await supabase
      .from("cumplimiento_dieta_dia")
      .update({ cumplido })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error al actualizar cumplimiento del día:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};
