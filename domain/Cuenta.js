// Capa: Dominio
// Cuenta encapsula el saldo y el historial de movimientos de un Usuario.
// Se separa de Usuario para que la lógica de dinero viva en un solo lugar
// (principio de responsabilidad única) y para poder extenderla a futuro
// (por ejemplo, si una persona llega a tener más de una cuenta).

import { Movimiento } from "./Movimiento.js";

export class Cuenta {
    constructor(numeroCuenta, saldoInicial = 0) {
        this.numeroCuenta = numeroCuenta;
        this.saldo = saldoInicial;
        this.movimientos = [];
    }

    retirar(monto, responsable = "titular") {
        if (!Number.isFinite(monto) || monto <= 0 || monto > this.saldo) return false;
        this.saldo -= monto;
        this.movimientos.unshift(new Movimiento("Retiro", monto, this.saldo, responsable));
        return true;
    }

    consignar(monto, responsable = "titular") {
        if (!Number.isFinite(monto) || monto <= 0) return false;
        this.saldo += monto;
        this.movimientos.unshift(new Movimiento("Consignación", monto, this.saldo, responsable));
        return true;
    }

    consultarSaldo() {
        return this.saldo;
    }

    obtenerMovimientos() {
        return this.movimientos;
    }

    toJSON() {
        return {
            numeroCuenta: this.numeroCuenta,
            saldo: this.saldo,
            movimientos: this.movimientos
        };
    }
}