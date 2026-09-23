// Capa: Dominio
// Persona es la clase base abstracta para cualquiera que use el sistema.
// No debe instanciarse directamente: usa Usuario, Cajero o Administrador.

export class Persona {
    constructor(nombre, id, correo, contrasenia) {
        if (new.target === Persona) {
            throw new Error("Persona es una clase base y no debe instanciarse directamente.");
        }
        this.nombre = nombre;
        this.id = id;
        this.correo = correo;
        this.contrasenia = contrasenia;
    }

    // Cada subclase debe declarar su propio rol ("usuario", "cajero", "administrador")
    get rol() {
        throw new Error("Las subclases de Persona deben implementar el getter 'rol'.");
    }

    validarCredenciales(nombre, contrasenia) {
        return this.nombre === nombre && this.contrasenia === contrasenia;
    }

    // Serializa los campos comunes; las subclases extienden este objeto con sus propios datos.
    toJSON() {
        return {
            nombre: this.nombre,
            id: this.id,
            correo: this.correo,
            contrasenia: this.contrasenia,
            rol: this.rol
        };
    }
}