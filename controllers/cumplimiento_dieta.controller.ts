import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

//Actualizar estado de cumplimiento
export const actualizarCumplimientoDieta = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { cumplido } = req.body;

    if (cumplido === undefined) {
      return res.status(400).json({
        error: "El campo 'cumplido' es requerido",
      });
    }

    //Verificar existencia del registro
    const { data: registroExistente, error: errorExistente } = await supabase
      .from("cumplimiento_dieta")
      .select("id_cumplimiento_dieta")
      .eq("id_cumplimiento_dieta", id)
      .single();

    if (errorExistente || !registroExistente) {
      return res.status(404).json({
        error: "Registro de cumplimiento no encontrado",
      });
    }

    const { data, error } = await supabase
      .from("cumplimiento_dieta")
      .update({ cumplido })
      .eq("id_cumplimiento_dieta", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al actualizar cumplimiento de dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
