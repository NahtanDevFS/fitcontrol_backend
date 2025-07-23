import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

// Obtener detalles de alimentos de una dieta_alimento
export const getDetalleAlimentoDieta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("dieta_alimento_detalle")
      .select("*")
      .eq("id_dieta_alimento", id)
      .order("id_dieta_alimento_detalle", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener los detalles de alimentos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener un detalle específico por ID
export const getDetalleAlimentoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("dieta_alimento_detalle")
      .select("*")
      .eq("id_dieta_alimento_detalle", id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res
        .status(404)
        .json({ error: "Detalle de alimento no encontrado" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener el detalle de alimento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear un nuevo detalle de alimento
export const crearDetalleAlimento = async (req: Request, res: Response) => {
  try {
    const {
      id_dieta_alimento,
      nombre_alimento,
      tipo_alimento,
      calorias_alimento,
      proteina_alimento,
      grasas_alimento,
      carbohidratos_alimento,
      gramos_alimento,
    } = req.body;

    // Validación básica
    if (
      !id_dieta_alimento ||
      !nombre_alimento ||
      !tipo_alimento ||
      calorias_alimento === undefined ||
      proteina_alimento === undefined ||
      grasas_alimento === undefined ||
      carbohidratos_alimento === undefined ||
      gramos_alimento === undefined
    ) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios",
      });
    }

    // Validar valores numéricos
    if (
      isNaN(calorias_alimento) ||
      isNaN(proteina_alimento) ||
      isNaN(grasas_alimento) ||
      isNaN(carbohidratos_alimento) ||
      isNaN(gramos_alimento)
    ) {
      return res.status(400).json({
        error: "Los campos nutricionales deben ser valores numéricos",
      });
    }

    const { data, error } = await supabase
      .from("dieta_alimento_detalle")
      .insert([
        {
          id_dieta_alimento,
          nombre_alimento,
          tipo_alimento,
          calorias_alimento: parseFloat(calorias_alimento),
          proteina_alimento: parseFloat(proteina_alimento),
          grasas_alimento: parseFloat(grasas_alimento),
          carbohidratos_alimento: parseFloat(carbohidratos_alimento),
          gramos_alimento: parseFloat(gramos_alimento),
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error al crear detalle de alimento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar un detalle de alimento
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

    // Validar que el registro existe
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

    // Campos a actualizar
    const updates: Record<string, any> = {};
    if (nombre_alimento) updates.nombre_alimento = nombre_alimento;
    if (tipo_alimento) updates.tipo_alimento = tipo_alimento;

    // Validar y actualizar campos numéricos
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

    // Si no hay campos válidos para actualizar
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

// Eliminar un detalle de alimento
export const eliminarDetalleAlimento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar existencia
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

    // Eliminación
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

// Obtener resumen nutricional por id_dieta_alimento
export const getResumenNutricional = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("dieta_alimento_detalle")
      .select(
        "calorias_alimento, proteina_alimento, grasas_alimento, carbohidratos_alimento, gramos_alimento"
      )
      .eq("id_dieta_alimento", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.json({
        total_calorias: 0,
        total_proteina: 0,
        total_grasas: 0,
        total_carbohidratos: 0,
        total_gramos: 0,
      });
    }

    const resumen = data.reduce(
      (acc, item) => ({
        total_calorias: acc.total_calorias + (item.calorias_alimento || 0),
        total_proteina: acc.total_proteina + (item.proteina_alimento || 0),
        total_grasas: acc.total_grasas + (item.grasas_alimento || 0),
        total_carbohidratos:
          acc.total_carbohidratos + (item.carbohidratos_alimento || 0),
        total_gramos: acc.total_gramos + (item.gramos_alimento || 0),
      }),
      {
        total_calorias: 0,
        total_proteina: 0,
        total_grasas: 0,
        total_carbohidratos: 0,
        total_gramos: 0,
      }
    );

    res.json(resumen);
  } catch (error) {
    console.error("Error al obtener resumen nutricional:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
