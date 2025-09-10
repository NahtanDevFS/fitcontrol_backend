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

export const getDietTrackerForToday = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID del usuario
    const hoy = new Date();
    const fechaHoyStr = hoy.toISOString().split("T")[0];
    const nombreDiaHoy = diasSemanaMapa[hoy.getDay()];

    // 1. Obtener dieta activa
    const { data: dieta } = await supabase
      .from("dieta")
      .select("id_dieta, dias:dieta_alimento(*)")
      .eq("id_usuario", id)
      .limit(1)
      .single();
    if (!dieta) return res.json({ diaCumplido: false, comidasDeHoy: [] });

    // 2. Filtrar comidas programadas para hoy
    const comidasProgramadas = dieta.dias.filter(
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
