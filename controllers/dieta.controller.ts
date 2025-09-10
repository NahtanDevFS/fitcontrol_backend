import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

const diasSemanaMapa: { [key: number]: string } = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

// Obtener dietas de un usuario filtrando por id_usuario
export const getDietasUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("dieta")
      .select("*")
      .eq("id_usuario", id)
      .order("fecha_creacion_dieta", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener las dietas del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener una dieta específica por su ID
export const getDietaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("dieta")
      .select("*")
      .eq("id_dieta", id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Dieta no encontrada" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al obtener la dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear una nueva dieta
export const crearDieta = async (req: Request, res: Response) => {
  try {
    const { id_usuario, nombre_dieta, fecha_creacion_dieta, estado } = req.body;

    // Validación básica
    if (!id_usuario || !nombre_dieta) {
      return res.status(400).json({
        error: "Los campos id_usuario y nombre_dieta son obligatorios",
      });
    }

    const { data, error } = await supabase
      .from("dieta")
      .insert([
        {
          id_usuario,
          nombre_dieta,
          fecha_creacion_dieta, //new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
          estado: estado || 1, // Valor por defecto si no se proporciona
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error al crear dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar una dieta existente
export const actualizarDieta = async (req: Request, res: Response) => {
  try {
    const id_dieta = req.params.id;
    const { nombre_dieta, estado } = req.body;

    // Validar que la dieta existe
    const { data: dietaExistente, error: errorExistente } = await supabase
      .from("dieta")
      .select("id_dieta")
      .eq("id_dieta", id_dieta)
      .single();

    if (errorExistente || !dietaExistente) {
      return res.status(404).json({ error: "Dieta no encontrada" });
    }

    // Campos a actualizar
    const updates: Record<string, any> = {};
    if (nombre_dieta) updates.nombre_dieta = nombre_dieta;
    if (estado !== undefined) updates.estado = estado;

    // Si no hay campos válidos para actualizar
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos válidos para actualizar" });
    }

    const { data, error } = await supabase
      .from("dieta")
      .update(updates)
      .eq("id_dieta", id_dieta)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error al actualizar dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Cambiar el estado de una dieta
export const cambiarEstadoDieta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (estado === undefined) {
      return res.status(400).json({ error: "El campo estado es requerido" });
    }

    const { data, error } = await supabase
      .from("dieta")
      .update({ estado })
      .eq("id_dieta", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error al cambiar estado de la dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar una dieta
export const eliminarDieta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar existencia
    const { error: verifyError } = await supabase
      .from("dieta")
      .select("id_dieta")
      .eq("id_dieta", id)
      .single();

    if (verifyError) {
      return res.status(404).json({ error: "Dieta no encontrada" });
    }

    // Eliminación
    const { error } = await supabase.from("dieta").delete().eq("id_dieta", id);

    if (error) {
      return res.status(400).json({
        error: "Error al eliminar",
        detalles: error.message,
      });
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error("Error al eliminar la dieta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// función para obtener los datos de dieta completos del usuario
export const getDietaCompletaUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID del usuario

    // 1. Obtener la dieta principal del usuario con todas sus comidas y alimentos
    let { data: dieta, error: dietaError } = await supabase
      .from("dieta")
      .select("*, dieta_alimento(*, dieta_alimento_detalle(*))")
      .eq("id_usuario", id)
      .maybeSingle();

    if (dietaError) throw dietaError;

    // Si el usuario no tiene dieta, se crea una por defecto
    if (!dieta) {
      const { data: nuevaDieta, error: createError } = await supabase
        .from("dieta")
        .insert({ id_usuario: id, nombre_dieta: "Mi Dieta Principal" })
        .select("*, dieta_alimento(*, dieta_alimento_detalle(*))") // Seleccionamos de nuevo la estructura completa
        .single();
      if (createError) throw createError;
      dieta = nuevaDieta;
    }

    // --- CORRECCIÓN CLAVE: Asegurarse de que las relaciones son arrays ---
    // Asegúrate de que las relaciones anidadas sean arrays antes de usarlas.
    dieta.dieta_alimento = dieta.dieta_alimento || [];
    dieta.dieta_alimento.forEach((comida: any) => {
      comida.dieta_alimento_detalle = comida.dieta_alimento_detalle || [];
    });

    // 2. Obtener todos los registros de cumplimiento para esa dieta
    const { data: cumplimientos, error: cumplimientosError } = await supabase
      .from("cumplimiento_dieta_dia")
      .select("*")
      .eq("id_usuario", id)
      .eq("id_dieta", dieta.id_dieta);

    if (cumplimientosError) throw cumplimientosError;

    const cumplimientosMap = new Map(
      cumplimientos.map((c: any) => [c.fecha_a_cumplir, c.cumplido])
    );
    const diasConDieta = new Set<string>();
    dieta.dieta_alimento.forEach((comida: any) => {
      if (comida.dieta_alimento_detalle.length > 0)
        diasConDieta.add(comida.dia_semana);
    });

    // 3. Calcular la racha
    let rachaDieta = 0;
    const hoy = new Date();
    const fechaHoyStr = hoy.toISOString().split("T")[0];
    if (cumplimientosMap.get(fechaHoyStr) === true) rachaDieta++;
    for (let i = 1; i < 90; i++) {
      const diaAnterior = new Date();
      diaAnterior.setDate(hoy.getDate() - i);
      const nombreDia = diasSemanaMapa[diaAnterior.getDay()];
      const fechaStr = diaAnterior.toISOString().split("T")[0];
      if (diasConDieta.has(nombreDia)) {
        if (cumplimientosMap.get(fechaStr) === true) rachaDieta++;
        else break;
      }
    }

    // 4. Generar datos del calendario para los últimos 35 días
    const diasCalendario = [];
    const hoySinHora = new Date(new Date().setHours(0, 0, 0, 0));
    for (let i = 34; i >= 0; i--) {
      const dia = new Date();
      dia.setDate(hoy.getDate() - i);
      dia.setHours(0, 0, 0, 0);
      const fechaStr = dia.toISOString().split("T")[0];
      const nombreDia = diasSemanaMapa[dia.getDay()];
      let status = "pending";
      if (dia > hoySinHora) {
        status = "future";
      } else if (diasConDieta.has(nombreDia)) {
        const cumplido = cumplimientosMap.get(fechaStr);
        if (cumplido === true) status = "completed";
        else if (cumplido === false && dia < hoySinHora) status = "missed";
      } else {
        status = "rest";
      }
      diasCalendario.push({ fecha: dia.toISOString().split("T")[0], status });
    }

    // 5. Formatear la dieta en la estructura que el frontend espera
    const diasMap: { [key: string]: any } = {};
    [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ].forEach((dia) => {
      diasMap[dia] = {};
      ["Desayuno", "Almuerzo", "Cena", "Snacks"].forEach((tiempo) => {
        diasMap[dia][tiempo] = { alimentos: [] };
      });
    });
    dieta.dieta_alimento.forEach((alimento: any) => {
      diasMap[alimento.dia_semana][alimento.tiempo_comida] = {
        ...alimento,
        alimentos: alimento.dieta_alimento_detalle,
      };
    });

    // 6. Ensamblar y enviar la respuesta completa
    const responsePayload = {
      dieta: { ...dieta, dias: diasMap },
      racha: rachaDieta,
      calendario: diasCalendario,
    };

    res.status(200).json(responsePayload);
  } catch (error: any) {
    console.error("Error al obtener datos completos de la dieta:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};
