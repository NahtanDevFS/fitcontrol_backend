//rutina.controller.ts
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

export const getRutinasCompletasUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params; //ID del usuario

    //Obtener todas las rutinas y la rutina activa en paralelo
    const [rutinasRes, rutinaActivaRes] = await Promise.all([
      supabase
        .from("rutina")
        .select(
          "*, dias:rutina_dia_semana(*, ejercicios:rutina_dia_semana_ejercicio(*, ejercicio(*)))"
        )
        .eq("id_usuario", id),
      supabase
        .from("rutina")
        .select("*, dias:rutina_dia_semana(*)")
        .eq("id_usuario", id)
        .eq("estado", 1)
        .limit(1)
        .single(),
    ]);

    if (rutinasRes.error) throw rutinasRes.error;

    const rutinas = rutinasRes.data || [];
    const rutinaActiva = rutinaActivaRes.data;

    //Calcular Racha y Calendario (solo si hay una rutina activa)
    let rachaRutina = 0;
    let calendario = [];
    if (rutinaActiva && rutinaActiva.dias && rutinaActiva.dias.length > 0) {
      const diasConRutina = new Set(
        rutinaActiva.dias.map((d: any) => d.dia_semana)
      );
      const idsDiasConRutina = rutinaActiva.dias.map(
        (d: any) => d.id_rutina_dia_semana
      );

      const { data: cumplimientos } = await supabase
        .from("cumplimiento_rutina")
        .select("*")
        .in("id_rutina_dia_semana", idsDiasConRutina);
      const cumplimientosMap = new Map(
        (cumplimientos || []).map((c: any) => [c.fecha_a_cumplir, c.cumplido])
      );

      const hoy = new Date();
      if (cumplimientosMap.get(hoy.toISOString().split("T")[0])) rachaRutina++;
      for (let i = 1; i < 90; i++) {
        const diaAnterior = new Date();
        diaAnterior.setDate(hoy.getDate() - i);
        const nombreDia = diasSemanaMapa[diaAnterior.getDay()];
        const fechaStr = diaAnterior.toISOString().split("T")[0];
        if (diasConRutina.has(nombreDia)) {
          if (cumplimientosMap.get(fechaStr)) rachaRutina++;
          else break;
        }
      }

      const hoySinHora = new Date(new Date().setHours(0, 0, 0, 0));
      for (let i = 34; i >= 0; i--) {
        const dia = new Date();
        dia.setDate(hoy.getDate() - i);
        dia.setHours(0, 0, 0, 0);
        const fechaStr = dia.toISOString().split("T")[0];
        const nombreDia = diasSemanaMapa[dia.getDay()];
        let status = "pending";

        if (dia > hoySinHora) status = "future";
        else if (diasConRutina.has(nombreDia)) {
          const cumplido = cumplimientosMap.get(fechaStr);
          if (cumplido === true) status = "completed";
          else if (cumplido === false && dia < hoySinHora) status = "missed";
        } else {
          status = "rest";
        }
        calendario.push({ fecha: fechaStr, status });
      }
    }

    res.json({
      rutinas,
      rutinaActiva,
      racha: rachaRutina,
      calendario,
    });
  } catch (error: any) {
    console.error("Error al obtener datos de rutina:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};

// export const getRutinaUsuario = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params; //id del usuario

//     //Consulta anidada para traer todo de una vez
//     const { data, error } = await supabase
//       .from("rutina")
//       .select(
//         `
//         id_rutina,
//         nombre_rutina,
//         fecha_creacion_rutina,
//         rutina_dia_semana (
//           id_rutina_dia_semana,
//           dia_semana,
//           rutina_dia_semana_ejercicio (
//             id_rutina_dia_semana_ejercicio,
//             repeticiones,
//             series,
//             peso_ejercicio,
//             ejercicio (
//               id_ejercicio,
//               nombre_ejercicio
//             )
//           )
//         )
//       `
//       )
//       .eq("id_usuario", id);

//     if (error) {
//       console.error("Error de Supabase:", error);
//       return res.status(500).json({ error: error.message });
//     }

//     //Cambiamos los nombres de las tablas anidadas para que coincidan con los tipos del frontend
//     const rutinasFormateadas = data.map((rutina) => ({
//       ...rutina,
//       dias: rutina.rutina_dia_semana.map((dia) => ({
//         ...dia,
//         ejercicios: dia.rutina_dia_semana_ejercicio,
//       })),
//     }));

//     res.json(rutinasFormateadas);
//   } catch (error) {
//     console.error("Error al obtener la rutina completa:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

export const crearRutina = async (req: Request, res: Response) => {
  try {
    const { id_usuario, nombre_rutina } = req.body;

    //Validación básica
    if (!id_usuario || !nombre_rutina) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    const { data, error } = await supabase
      .from("rutina")
      .insert([
        {
          id_usuario,
          nombre_rutina,
        },
      ])
      .select("id_rutina")
      .single(); //Para obtener el objeto recién creado

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error al crear la rutina:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// export const actualizarRutina = async (req: Request, res: Response) => {
//   try {
//     const id_rutina = req.params.id;
//     const { nombre_rutina, estado } = req.body;

//     //Validar que el usuario existe
//     const { data: rutinaExistente, error: errorExistente } = await supabase
//       .from("rutina")
//       .select("id_rutina")
//       .eq("id_rutina", id_rutina)
//       .single();

//     if (errorExistente || !rutinaExistente) {
//       return res.status(404).json({ error: "Rutina no encontrada" });
//     }

//     //Campos a actualizar
//     const updates: Record<string, any> = {};
//     if (nombre_rutina) updates.nombre_rutina = nombre_rutina;
//     if (estado !== undefined) updates.estado = parseInt(estado);

//     //Si no hay campos válidos para actualizar
//     if (Object.keys(updates).length === 0) {
//       return res
//         .status(400)
//         .json({ error: "No se proporcionaron campos válidos para actualizar" });
//     }

//     const { data, error } = await supabase
//       .from("rutina")
//       .update(updates)
//       .eq("id_rutina", id_rutina)
//       .select("id_usuario, nombre_rutina, estado");

//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }

//     res.json(data[0]);
//   } catch (error) {
//     console.error("Error al actualizar rutina:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

export const eliminarRutina = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; //id de la rutina

    const { error } = await supabase
      .from("rutina")
      .delete()
      .eq("id_rutina", id);

    if (error) {
      console.error("Error al eliminar la rutina:", error);
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send(); //204 No Content, significa que todo salió bien
  } catch (error) {
    console.error("Error de servidor al eliminar rutina:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearRutinaCompleta = async (req: Request, res: Response) => {
  const { nombre_rutina, id_usuario, dias } = req.body;

  try {
    const { data: nuevaRutina, error: rutinaError } = await supabase
      .from("rutina")
      .insert({ nombre_rutina, id_usuario })
      .select("id_rutina")
      .single();

    if (rutinaError) throw rutinaError;
    const id_rutina = nuevaRutina.id_rutina;

    for (const dia of dias) {
      const { data: nuevoDia, error: diaError } = await supabase
        .from("rutina_dia_semana")
        .insert({ id_rutina, dia_semana: dia.dia_semana })
        .select("id_rutina_dia_semana")
        .single();

      if (diaError) throw diaError;

      if (dia.ejercicios && dia.ejercicios.length > 0) {
        //Mapeamos explícitamente solo los campos que la BD necesita.
        const ejerciciosParaInsertar = dia.ejercicios.map((ej: any) => ({
          id_rutina_dia_semana: nuevoDia.id_rutina_dia_semana,
          id_ejercicio: ej.id_ejercicio,
          series: ej.series,
          repeticiones: ej.repeticiones,
          peso_ejercicio: ej.peso_ejercicio,
        }));

        const { error: ejError } = await supabase
          .from("rutina_dia_semana_ejercicio")
          .insert(ejerciciosParaInsertar);

        if (ejError) throw ejError;
      }
    }

    res
      .status(201)
      .json({ success: true, message: "Rutina creada correctamente" });
  } catch (error) {
    console.error("Error al crear la rutina completa:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: error,
    });
  }
};

export const actualizarRutinaCompleta = async (req: Request, res: Response) => {
  const id_rutina = parseInt(req.params.id, 10);
  const { nombre_rutina, dias: diasNuevos } = req.body;

  if (isNaN(id_rutina)) {
    return res.status(400).json({ error: "El ID de la rutina no es válido" });
  }

  try {
    //Actualizar el nombre de la rutina
    const { error: updateError } = await supabase
      .from("rutina")
      .update({ nombre_rutina })
      .eq("id_rutina", id_rutina);
    if (updateError) throw updateError;

    //Obtener los días existentes en la base de datos para esta rutina
    const { data: diasViejos, error: fetchError } = await supabase
      .from("rutina_dia_semana")
      .select("id_rutina_dia_semana, dia_semana")
      .eq("id_rutina", id_rutina);
    if (fetchError) throw fetchError;

    const diasViejosMap = new Map(
      diasViejos.map((d) => [d.dia_semana, d.id_rutina_dia_semana])
    );
    const diasNuevosSet = new Set(diasNuevos.map((d: any) => d.dia_semana));

    //Identificar y eliminar los días que ya no existen
    const idsDiasAEliminar = diasViejos
      .filter((d) => !diasNuevosSet.has(d.dia_semana))
      .map((d) => d.id_rutina_dia_semana);

    if (idsDiasAEliminar.length > 0) {
      const { error: deleteError } = await supabase
        .from("rutina_dia_semana")
        .delete()
        .in("id_rutina_dia_semana", idsDiasAEliminar);
      if (deleteError) throw deleteError;
    }

    //Iterar sobre los días nuevos para agregar o actualizar
    for (const diaNuevo of diasNuevos) {
      const idDiaExistente = diasViejosMap.get(diaNuevo.dia_semana);

      if (idDiaExistente) {
        //Si el día ya existe, solo actualizamos sus ejercicios
        const { error: deleteEjerciciosError } = await supabase
          .from("rutina_dia_semana_ejercicio")
          .delete()
          .eq("id_rutina_dia_semana", idDiaExistente);
        if (deleteEjerciciosError) throw deleteEjerciciosError;

        if (diaNuevo.ejercicios && diaNuevo.ejercicios.length > 0) {
          const ejerciciosParaInsertar = diaNuevo.ejercicios.map((ej: any) => ({
            id_rutina_dia_semana: idDiaExistente,
            id_ejercicio: ej.id_ejercicio,
            series: ej.series,
            repeticiones: ej.repeticiones,
            peso_ejercicio: ej.peso_ejercicio,
          }));
          const { error: insertEjerciciosError } = await supabase
            .from("rutina_dia_semana_ejercicio")
            .insert(ejerciciosParaInsertar);
          if (insertEjerciciosError) throw insertEjerciciosError;
        }
      } else {
        //Si es un día nuevo, lo creamos junto con sus ejercicios
        const { data: nuevoDia, error: diaError } = await supabase
          .from("rutina_dia_semana")
          .insert({ id_rutina, dia_semana: diaNuevo.dia_semana })
          .select("id_rutina_dia_semana")
          .single();
        if (diaError) throw diaError;

        if (diaNuevo.ejercicios && diaNuevo.ejercicios.length > 0) {
          const ejerciciosParaInsertar = diaNuevo.ejercicios.map((ej: any) => ({
            id_rutina_dia_semana: nuevoDia.id_rutina_dia_semana,
            id_ejercicio: ej.id_ejercicio,
            series: ej.series,
            repeticiones: ej.repeticiones,
            peso_ejercicio: ej.peso_ejercicio,
          }));
          const { error: ejError } = await supabase
            .from("rutina_dia_semana_ejercicio")
            .insert(ejerciciosParaInsertar);
          if (ejError) throw ejError;
        }
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Rutina actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar la rutina completa:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: error,
    });
  }
};

export const getRutinaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; //id de la rutina

    const { data, error } = await supabase
      .from("rutina")
      .select(
        `
        id_rutina,
        nombre_rutina,
        dias:rutina_dia_semana (
          id_rutina_dia_semana,
          dia_semana,
          ejercicios:rutina_dia_semana_ejercicio (
            series,
            repeticiones,
            peso_ejercicio,
            ejercicio (
              id_ejercicio,
              nombre_ejercicio
            )
          )
        )
      `
      )
      .eq("id_rutina", id)
      .single(); //Asegura que devuelve un solo objeto, no un array

    if (error) {
      console.error("Error de Supabase:", error);
      //Si no encuentra la rutina, single() devuelve un error.
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Rutina no encontrada" });
      }
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Rutina no encontrada" });
    }

    //El alias en la query ya formatea la data, así que la podemos enviar directamente.
    res.json(data);
  } catch (error) {
    console.error("Error al obtener la rutina por ID:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
