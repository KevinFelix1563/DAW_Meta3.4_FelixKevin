import db from '../../models/index.cjs';
import bcrypt from 'bcryptjs'; // Añadimos bcrypt
const { Persona, Tarea, Tag } = db;

export const obtenerTodas = async (req, res) => {
  try {
    const personas = await Persona.findAll({
      attributes: { exclude: ['password'] } // Nunca mandamos las contraseñas al frontend
    });
    res.json({ success: true, data: personas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const registro = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    
    // Encriptamos la contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nueva = await Persona.create({ 
      nombre, 
      email, 
      password: hashedPassword, 
      rol: rol || 'usuario', 
      activo: true 
    });
    
    res.status(201).json({ success: true, data: nueva });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const modificar = async (req, res) => {
  try {
    const { id } = req.params;
    const persona = await Persona.findByPk(id);
    if (!persona) return res.status(404).json({ success: false, message: 'No encontrado' });
    
    // Si el admin decide cambiar la contraseña, la encriptamos
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    await persona.update(req.body);
    res.json({ success: true, data: persona });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body; 
    const persona = await Persona.findByPk(id);
    await persona.update({ activo });
    res.json({ success: true, message: `Usuario ${activo ? 'activado' : 'desactivado'}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const obtenerTagsDePersona = async (req, res) => {
  try {
    const { id } = req.params;
    const persona = await Persona.findByPk(id, {
      include: {
        model: Tarea, as: 'tareas',
        include: { model: Tag, as: 'etiquetas', through: { attributes: [] } }
      }
    });
    const tags = [...new Set(persona.tareas.flatMap(t => t.etiquetas))];
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};