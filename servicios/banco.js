// Capa: Servicios
// Banco es el corazón de la lógica de negocio: mantiene las listas de
// Usuarios, Cajeros y Administradores, gestiona el registro y la
// autenticación, y delega la persistencia a Almacenamiento.

import { Usuario } from "../domain/Usuario.js";
import { Cajero } from "../domain/Cajero.js";
import { Administrador } from "../domain/Administrador.js";
import { Almacenamiento } from "../Infracstructura/Almacenamiento.js";

const CLAVE_USUARIOS = "miplata_usuarios";
const CLAVE_CAJEROS = "miplata_cajeros";
const CLAVE_ADMINISTRADORES = "miplata_administradores";

export class Banco {
    constructor() {
        this.almacenamiento = new Almacenamiento();
        this.usuarios = [];
        this.cajeros = [];
        this.administradores = [];
        this.cargarTodo();
        this.asegurarAdministradorPorDefecto();
    }

    // ---------- Carga desde almacenamiento ----------
    cargarTodo() {
        this.usuarios = this.almacenamiento.obtener(CLAVE_USUARIOS, []).map(datos => this.reconstruirUsuario(datos));
        this.cajeros = this.almacenamiento.obtener(CLAVE_CAJEROS, []).map(datos => this.reconstruirCajero(datos));
        this.administradores = this.almacenamiento.obtener(CLAVE_ADMINISTRADORES, []).map(datos => this.reconstruirAdministrador(datos));
    }

    reconstruirUsuario(datos) {
        const usuario = new Usuario(datos.nombre, datos.id, datos.correo, datos.contrasenia, datos.cuenta?.saldo ?? 0, datos.producto);
        usuario.cuenta.numeroCuenta = datos.cuenta?.numeroCuenta ?? usuario.cuenta.numeroCuenta;
        usuario.cuenta.movimientos = datos.cuenta?.movimientos ?? [];
        usuario.activo = datos.activo ?? true;
        return usuario;
    }

    reconstruirCajero(datos) {
        return new Cajero(datos.nombre, datos.id, datos.correo, datos.contrasenia, datos.codigoEmpleado);
    }

    reconstruirAdministrador(datos) {
        return new Administrador(datos.nombre, datos.id, datos.correo, datos.contrasenia);
    }

    // ---------- Persistencia ----------
    persistirUsuarios() { this.almacenamiento.guardar(CLAVE_USUARIOS, this.usuarios.map(u => u.toJSON())); }
    persistirCajeros() { this.almacenamiento.guardar(CLAVE_CAJEROS, this.cajeros.map(c => c.toJSON())); }
    persistirAdministradores() { this.almacenamiento.guardar(CLAVE_ADMINISTRADORES, this.administradores.map(a => a.toJSON())); }

    // Crea un administrador de arranque si el sistema está completamente vacío,
    // porque nadie puede crear al primer administrador si no existe ninguno.
    asegurarAdministradorPorDefecto() {
        if (this.administradores.length === 0) {
            const admin = new Administrador("admin", "0000", "admin@miplata.com", "admin123");
            this.administradores.push(admin);
            this.persistirAdministradores();
        }
    }

    // ---------- Registro ----------
    existeNombre(nombre) {
        return [...this.usuarios, ...this.cajeros, ...this.administradores]
            .some(persona => persona.nombre.toLowerCase() === nombre.toLowerCase());
    }

    registrarUsuario({ nombre, id, correo, contrasenia, saldoInicial, producto }) {
        if (this.existeNombre(nombre)) return { exito: false, mensaje: "Ese nombre ya está en uso." };
        const usuario = new Usuario(nombre, id, correo, contrasenia, saldoInicial, producto);
        this.usuarios.push(usuario);
        this.persistirUsuarios();
        return { exito: true, persona: usuario };
    }

    registrarCajero({ nombre, id, correo, contrasenia, codigoEmpleado }) {
        if (this.existeNombre(nombre)) return { exito: false, mensaje: "Ese nombre ya está en uso." };
        const cajero = new Cajero(nombre, id, correo, contrasenia, codigoEmpleado);
        this.cajeros.push(cajero);
        this.persistirCajeros();
        return { exito: true, persona: cajero };
    }

    eliminarCajero(idCajero) {
        this.cajeros = this.cajeros.filter(c => c.id !== idCajero);
        this.persistirCajeros();
    }

    // ---------- Autenticación ----------
    // Busca en las tres listas porque un mismo formulario de login sirve
    // para los tres roles; el Banco es el único que sabe dónde buscar.
    autenticar(nombre, contrasenia) {
        const admin = this.administradores.find(a => a.validarCredenciales(nombre, contrasenia));
        if (admin) return { persona: admin, rol: "administrador" };

        const cajero = this.cajeros.find(c => c.validarCredenciales(nombre, contrasenia));
        if (cajero) return { persona: cajero, rol: "cajero" };

        const usuario = this.usuarios.find(u => u.validarCredenciales(nombre, contrasenia));
        if (usuario) return { persona: usuario, rol: "usuario" };

        return null;
    }

    // ---------- Consultas ----------
    buscarUsuario(criterio) {
        const texto = criterio.trim().toLowerCase();
        return this.usuarios.find(u => u.id === criterio || u.nombre.toLowerCase() === texto) || null;
    }

    listarUsuarios() { return this.usuarios; }
    listarCajeros() { return this.cajeros; }

    generarReporte() {
        return {
            totalUsuarios: this.usuarios.length,
            totalCajeros: this.cajeros.length,
            saldoTotal: this.usuarios.reduce((acc, u) => acc + u.saldo, 0),
            totalMovimientos: this.usuarios.reduce((acc, u) => acc + u.movimientos.length, 0),
            usuariosBloqueados: this.usuarios.filter(u => !u.activo).length
        };
    }
}