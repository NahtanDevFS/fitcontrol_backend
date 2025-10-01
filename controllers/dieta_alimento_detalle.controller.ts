import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

//Crear un nuevo detalle de alimento
export const crearDetalleAlimento = async (req: Request, res: Response) => {
  try {
    const {
      id_dieta,
      dia_semana,
      tiempo_comida,
      nombre_alimento,
      calorias_alimento,
      proteina_alimento,
      grasas_alimento,
      carbohidratos_alimento,
      gramos_alimento,
    } = req.body;

    //Validación de datos esenciales
    if (!id_dieta || !dia_semana || !tiempo_comida || !nombre_alimento) {
      return res
        .status(400)
        .json({ error: "Faltan datos requeridos para añadir el alimento." });
    }

    //Busca si ya existe un registro para esa comida en ese día
    let { data: meal } = await supabase
      .from("dieta_alimento")
      .select("id_dieta_alimento")
      .eq("id_dieta", id_dieta)
      .eq("dia_semana", dia_semana)
      .eq("tiempo_comida", tiempo_comida)
      .maybeSingle();

    let mealId;
    //Si no existe, lo crea
    if (!meal) {
      const { data: newMeal, error: newMealError } = await supabase
        .from("dieta_alimento")
        .insert({ id_dieta, dia_semana, tiempo_comida })
        .select("id_dieta_alimento")
        .single();

      if (newMealError) throw newMealError;
      mealId = newMeal.id_dieta_alimento;
    } else {
      mealId = meal.id_dieta_alimento;
    }

    //Inserta el detalle del alimento con el ID de la comida correcto
    const { data: newDetail, error: detailError } = await supabase
      .from("dieta_alimento_detalle")
      .insert({
        id_dieta_alimento: mealId,
        nombre_alimento,
        calorias_alimento,
        proteina_alimento,
        grasas_alimento,
        carbohidratos_alimento,
        gramos_alimento,
      })
      .select()
      .single();

    if (detailError) throw detailError;

    res.status(201).json(newDetail);
  } catch (error: any) {
    console.error("Error al crear detalle de alimento:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};

//Actualizar un detalle de alimento
export const actualizarDetalleAlimento = async (
  req: Request,
  res: Response
) => {
  try {
    const id_dieta_alimento_detalle = req.params.id;
    const {
      nombre_alimento,
      tipo_alimento,
      calorias_alimento,
      proteina_alimento,
      grasas_alimento,
      carbohidratos_alimento,
      gramos_alimento,
    } = req.body;

    //Validar que el registro existe
    const { data: detalleExistente, error: errorExistente } = await supabase
      .from("dieta_alimento_detalle")
      .select("id_dieta_alimento_detalle")
      .eq("id_dieta_alimento_detalle", id_dieta_alimento_detalle)
      .single();

    if (errorExistente || !detalleExistente) {
      return res
        .status(404)
        .json({ error: "Detalle de alimento no encontrado" });
    }

    //Campos a actualizar
    const updates: Record<string, any> = {};
    if (nombre_alimento) updates.nombre_alimento = nombre_alimento;
    if (tipo_alimento) updates.tipo_alimento = tipo_alimento;

    //Validar y actualizar campos numéricos
    const camposNutricionales = [
      "calorias_alimento",
      "proteina_alimento",
      "grasas_alimento",
      "carbohidratos_alimento",
      "gramos_alimento",
    ];

    camposNutricionales.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        if (isNaN(req.body[campo])) {
          return res.status(400).json({
            error: `El campo ${campo} debe ser numérico`,
          });
        }
        updates[campo] = parseFloat(req.body[campo]);
      }
    });

    //Si no hay campos válidos para actualizar
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "No se proporcionaron campos válidos para actualizar",
      });
    }

    const { data, error } = await supabase
      .from("dieta_alimento_detalle")
      .update(updates)
      .eq("id_dieta_alimento_detalle", id_dieta_alimento_detalle)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error al actualizar detalle de alimento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

//Eliminar un detalle de alimento
export const eliminarDetalleAlimento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //Verificar existencia
    const { error: verifyError } = await supabase
      .from("dieta_alimento_detalle")
      .select("id_dieta_alimento_detalle")
      .eq("id_dieta_alimento_detalle", id)
      .single();

    if (verifyError) {
      return res
        .status(404)
        .json({ error: "Detalle de alimento no encontrado" });
    }

    //Eliminación
    const { error } = await supabase
      .from("dieta_alimento_detalle")
      .delete()
      .eq("id_dieta_alimento_detalle", id);

    if (error) {
      return res.status(400).json({
        error: "Error al eliminar",
        detalles: error.message,
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar detalle de alimento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
