import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

//Obtener cumplimientos de dieta por usuario
export const getCumplimientosDietaUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const id_usuario = req.params.id;
    const { fecha_inicio, fecha_fin } = req.query;

    let query = supabase
      .from("cumplimiento_dieta")
      .select("*")
      .eq("id_usuario", id_usuario);

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener cumplimientos de dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

//Obtener cumplimientos por dieta específica
export const getCumplimientosPorDietaAlimento = async (
  req: Request,
  res: Response
) => {
  try {
    const { id_dieta_alimento } = req.params;
    const { data, error } = await supabase
      .from("cumplimiento_dieta")
      .select("*")
      .eq("id_dieta_alimento", id_dieta_alimento)
      .order("fecha_a_cumplir_dieta", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener cumplimientos por dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

//Registrar un nuevo cumplimiento de dieta
export const crearCumplimientoDieta = async (req: Request, res: Response) => {
  try {
    const { id_usuario, id_dieta_alimento, fecha_a_cumplir_dieta, cumplido } =
      req.body;

    //Validación básica
    if (!id_usuario || !id_dieta_alimento || !fecha_a_cumplir_dieta) {
      return res.status(400).json({
        error:
          "Los campos id_usuario, id_dieta_alimento y fecha_a_cumplir_dieta son obligatorios",
      });
    }

    const { data, error } = await supabase
      .from("cumplimiento_dieta")
      .insert([
        {
          id_usuario,
          id_dieta_alimento,
          fecha_a_cumplir_dieta,
          cumplido: cumplido || false,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error al registrar cumplimiento de dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

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

//Eliminar un registro de cumplimiento
export const eliminarCumplimientoDieta = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    //Verificar existencia
    const { error: verifyError } = await supabase
      .from("cumplimiento_dieta")
      .select("id_cumplimiento_dieta")
      .eq("id_cumplimiento_dieta", id)
      .single();

    if (verifyError) {
      return res.status(404).json({
        error: "Registro de cumplimiento no encontrado",
      });
    }

    //Eliminación
    const { error } = await supabase
      .from("cumplimiento_dieta")
      .delete()
      .eq("id_cumplimiento_dieta", id);

    if (error) {
      return res.status(400).json({
        error: "Error al eliminar",
        detalles: error.message,
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar registro de cumplimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

//Obtener resumen de cumplimiento por fecha
export const getResumenCumplimientoFecha = async (
  req: Request,
  res: Response
) => {
  try {
    const { id_usuario, fecha } = req.params;

    //Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({
        error: "Formato de fecha inválido. Use YYYY-MM-DD",
      });
    }

    const { data, error } = await supabase
      .from("cumplimiento_dieta")
      .select("*, dieta_alimento(*)")
      .eq("id_usuario", id_usuario)
      .eq("fecha_a_cumplir_dieta", fecha);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    //Calcular resumen
    const total = data?.length || 0;
    const cumplidos = data?.filter((item) => item.cumplido).length || 0;
    const porcentaje = total > 0 ? Math.round((cumplidos / total) * 100) : 0;

    res.json({
      fecha,
      total_alimentos: total,
      alimentos_cumplidos: cumplidos,
      porcentaje_cumplimiento: porcentaje,
      detalles: data,
    });
  } catch (error) {
    console.error("Error al obtener resumen de cumplimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
