import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

//Crear un nuevo registro de progreso
export const crearProgresoUsuario = async (req: Request, res: Response) => {
  try {
    const { id_usuario, peso_actual, peso_deseado } = req.body;

    //Validación robusta en el backend
    if (!id_usuario || !peso_actual || !peso_deseado) {
      return res.status(400).json({
        error:
          "Los campos id_usuario, peso_actual y peso_deseado son obligatorios",
      });
    }

    const pa = parseFloat(peso_actual);
    const pd = parseFloat(peso_deseado);

    if (isNaN(pa) || isNaN(pd) || pa <= 0 || pd <= 0) {
      return res.status(400).json({
        error: "Los valores de peso deben ser números positivos.",
      });
    }

    if (pa === pd) {
      return res.status(400).json({
        error: "El peso actual y el objetivo no pueden ser iguales.",
      });
    }

    //Lógica de negocio movida al backend
    const objetivo = pd < pa ? "bajar" : "subir";

    const { data, error } = await supabase
      .from("progreso_usuario")
      .insert([
        {
          id_usuario,
          peso_actual: pa,
          peso_deseado: pd,
          objetivo,
          estado: 1, //Por defecto, la nueva meta está activa
          peso_inicial: pa, //El peso inicial es el peso actual al crear la meta
        },
      ])
      .select()
      .single();

    if (error) {
      //Si hay un error de base de datos (usuario no existe), lo captura
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error("Error al crear registro de progreso:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};

//Actualizar un registro de progreso
export const actualizarProgresoUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const id_progreso = req.params.id;
    const {
      fecha_inicio_proceso,
      fecha_final_proceso,
      peso_actual,
      peso_deseado,
      objetivo,
      estado,
    } = req.body;

    //Validar que el registro existe
    const { data: progresoExistente, error: errorExistente } = await supabase
      .from("progreso_usuario")
      .select("id_progreso")
      .eq("id_progreso", id_progreso)
      .single();

    if (errorExistente || !progresoExistente) {
      return res
        .status(404)
        .json({ error: "Registro de progreso no encontrado" });
    }

    //Campos a actualizar
    const updates: Record<string, any> = {};
    if (fecha_inicio_proceso)
      updates.fecha_inicio_proceso = fecha_inicio_proceso;
    if (fecha_final_proceso) updates.fecha_final_proceso = fecha_final_proceso;
    if (peso_actual) updates.peso_actual = peso_actual;
    if (peso_deseado) updates.peso_deseado = peso_deseado;
    if (objetivo) updates.objetivo = objetivo;
    if (estado !== undefined) updates.estado = estado;

    //Si no hay campos válidos para actualizar
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos válidos para actualizar" });
    }

    const { data, error } = await supabase
      .from("progreso_usuario")
      .update(updates)
      .eq("id_progreso", id_progreso)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error al actualizar progreso del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

//obtener el progreso activo y la unidad de peso
export const getProgresoActivoUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; //id del usuario

    //Hacemos ambas consultas en paralelo para mayor eficiencia
    const [progresoData, usuarioData] = await Promise.all([
      supabase
        .from("progreso_usuario")
        .select("*")
        .eq("id_usuario", id)
        .eq("estado", 1) //Solo el progreso activo
        .maybeSingle(),
      supabase
        .from("usuario")
        .select("unidad_peso")
        .eq("id_usuario", id)
        .single(),
    ]);

    //Si hay un error en cualquiera de las consultas, lo manejamos
    if (progresoData.error) throw progresoData.error;
    if (usuarioData.error) throw usuarioData.error;

    //Combinamos los resultados en una sola respuesta
    const respuesta = {
      progreso: progresoData.data,
      unidad_peso: usuarioData.data?.unidad_peso || "kg",
    };

    res.json(respuesta);
  } catch (error: any) {
    console.error("Error al obtener el progreso activo del usuario:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};
