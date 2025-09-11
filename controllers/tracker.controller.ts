// fitcontrol_backend/controllers/tracker.controller.ts

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

// --- FUNCIÓN AUXILIAR MODIFICADA ---
// Ahora calcula la fecha y el día basados en un offset de UTC.
// Para Guatemala (CST), el offset es -6 horas.
const getFechaLocal = (offsetHoras = -6) => {
  const ahoraUTC = new Date();
  // Creamos una nueva fecha ajustando la hora UTC con el offset
  const ahoraLocal = new Date(
    ahoraUTC.getTime() + offsetHoras * 60 * 60 * 1000
  );

  const anio = ahoraLocal.getUTCFullYear();
  const mes = String(ahoraLocal.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(ahoraLocal.getUTCDate()).padStart(2, "0");

  const nombreDia = diasSemanaMapa[ahoraLocal.getUTCDay()];

  return {
    fechaStr: `${anio}-${mes}-${dia}`,
    nombreDia: nombreDia,
  };
};

export const getDietTrackerForToday = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID del usuario
    //const hoy = new Date();
    const { fechaStr: fechaHoyStr, nombreDia: nombreDiaHoy } = getFechaLocal();

    // 1. Obtener dieta activa
    const { data: dieta } = await supabase
      .from("dieta")
      .select("id_dieta, dias:dieta_alimento(*)")
      .eq("id_usuario", id)
      .limit(1)
      .single();
    if (!dieta) return res.json({ diaCumplido: false, comidasDeHoy: [] });

    // --- CORRECCIÓN CLAVE ---
    const diasDeDieta = dieta.dias || [];

    // 2. Filtrar comidas programadas para hoy
    const comidasProgramadas = diasDeDieta.filter(
      (d: any) => d.dia_semana === nombreDiaHoy && d.id_dieta_alimento
    );
    if (comidasProgramadas.length === 0)
      return res.json({ diaCumplido: false, comidasDeHoy: [] });

    // 3. Verificar o crear registro del DÍA
    let { data: diaData } = await supabase
      .from("cumplimiento_dieta_dia")
      .select("id, cumplido")
      .eq("id_usuario", id)
      .eq("fecha_a_cumplir", fechaHoyStr)
      .maybeSingle();
    if (!diaData) {
      const { data: nuevoDiaData } = await supabase
        .from("cumplimiento_dieta_dia")
        .insert({
          id_usuario: id,
          id_dieta: dieta.id_dieta,
          fecha_a_cumplir: fechaHoyStr,
          dia_semana: nombreDiaHoy,
        })
        .select("id, cumplido")
        .single();
      diaData = nuevoDiaData;
    }

    // 4. Verificar o crear registros de CADA COMIDA
    const idsComidas = comidasProgramadas.map((c: any) => c.id_dieta_alimento!);
    const { data: comidasData } = await supabase
      .from("cumplimiento_dieta")
      .select("*")
      .eq("id_usuario", id)
      .eq("fecha_a_cumplir_dieta", fechaHoyStr)
      .in("id_dieta_alimento", idsComidas);

    const comidasACrear = [];
    for (const comida of comidasProgramadas) {
      if (
        !comidasData?.some(
          (c) => c.id_dieta_alimento === comida.id_dieta_alimento
        )
      ) {
        comidasACrear.push({
          id_usuario: id,
          id_dieta_alimento: comida.id_dieta_alimento!,
          fecha_a_cumplir_dieta: fechaHoyStr,
        });
      }
    }
    if (comidasACrear.length > 0) {
      await supabase.from("cumplimiento_dieta").insert(comidasACrear);
    }

    // 5. Volver a pedir los datos para tenerlos todos
    const { data: finalComidasData } = await supabase
      .from("cumplimiento_dieta")
      .select("*")
      .eq("id_usuario", id)
      .eq("fecha_a_cumplir_dieta", fechaHoyStr)
      .in("id_dieta_alimento", idsComidas);

    // 6. Formatear y enviar respuesta
    const comidasDeHoy = comidasProgramadas.map((comida: any) => {
      const registro = finalComidasData?.find(
        (c) => c.id_dieta_alimento === comida.id_dieta_alimento
      );
      return {
        ...comida,
        cumplido: registro?.cumplido || false,
        id_cumplimiento_dieta: registro?.id_cumplimiento_dieta,
      };
    });

    res.json({
      diaCumplido: diaData?.cumplido || false,
      id_cumplimiento_dia: diaData?.id,
      comidasDeHoy,
    });
  } catch (error: any) {
    console.error("Error al obtener tracker de dieta:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};

export const getRoutineTrackerForToday = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params; // ID del usuario
    //const hoy = new Date();
    const { fechaStr: fechaHoyStr, nombreDia: nombreDiaHoy } = getFechaLocal();

    // 1. Obtener la rutina activa del usuario
    const { data: rutinaActiva } = await supabase
      .from("rutina")
      .select(
        "*, dias:rutina_dia_semana(*, ejercicios:rutina_dia_semana_ejercicio(*, ejercicio(*)))"
      )
      .eq("id_usuario", id)
      .eq("estado", 1)
      .limit(1)
      .single();

    if (!rutinaActiva || !rutinaActiva.dias) {
      return res.json({ diaDeHoy: null, diaCumplido: false });
    }

    // 2. Encontrar el día de rutina que corresponde a hoy
    const rutinaDiaDeHoy = rutinaActiva.dias.find(
      (d: any) => d.dia_semana === nombreDiaHoy
    );

    if (!rutinaDiaDeHoy) {
      return res.json({ diaDeHoy: null, diaCumplido: false });
    }

    // 3. Verificar si ya existe un registro de cumplimiento para hoy, si no, crearlo.
    let { data: cumplimiento } = await supabase
      .from("cumplimiento_rutina")
      .select("id_cumplimiento_rutina, cumplido")
      .eq("id_rutina_dia_semana", rutinaDiaDeHoy.id_rutina_dia_semana)
      .eq("fecha_a_cumplir", fechaHoyStr)
      .maybeSingle();

    if (!cumplimiento) {
      const { data: nuevoCumplimiento } = await supabase
        .from("cumplimiento_rutina")
        .insert({
          id_rutina_dia_semana: rutinaDiaDeHoy.id_rutina_dia_semana,
          fecha_a_cumplir: fechaHoyStr,
          cumplido: false,
        })
        .select("id_cumplimiento_rutina, cumplido")
        .single();
      cumplimiento = nuevoCumplimiento;
    }

    res.json({
      diaDeHoy: rutinaDiaDeHoy,
      diaCumplido: cumplimiento?.cumplido || false,
      id_cumplimiento_rutina: cumplimiento?.id_cumplimiento_rutina,
    });
  } catch (error: any) {
    console.error("Error al obtener tracker de rutina:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};
