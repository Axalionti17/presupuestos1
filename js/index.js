"use strict";
class GestorTransacciones {
    constructor() {
        this.transacciones = [];
        this.saldoActual = 0;
        this.cargarDatos();
        this.inicializarEventos();
    }
    cargarDatos() {
        const datosGuardados = localStorage.getItem('transacciones');
        if (datosGuardados) {
            this.transacciones = JSON.parse(datosGuardados);
            this.calcularSaldoActual();
        }
        this.actualizarUI();
    }
    calcularSaldoActual() {
        this.saldoActual = this.transacciones.reduce((total, t) => {
            return total + (t.tipo === 'ingreso' ? t.monto : -t.monto);
        }, 0);
    }
    inicializarEventos() {
        const btnIngreso = document.getElementById('btn-ingreso');
        const btnGasto = document.getElementById('btn-gasto');
        const descripcionInput = document.getElementById('descripcion');
        btnIngreso === null || btnIngreso === void 0 ? void 0 : btnIngreso.addEventListener('click', () => this.procesarTransaccion('ingreso'));
        btnGasto === null || btnGasto === void 0 ? void 0 : btnGasto.addEventListener('click', () => this.procesarTransaccion('gasto'));
        // Validación en tiempo real para la descripción
        descripcionInput === null || descripcionInput === void 0 ? void 0 : descripcionInput.addEventListener('input', (e) => {
            const input = e.target;
            // Reemplazar cualquier carácter que no sea letra o espacio
            input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            this.validarDescripcion(input);
        });
    }
    validarDescripcion(input) {
        const errorDescripcion = document.getElementById('error-descripcion');
        const valor = input.value.trim();
        if (!errorDescripcion)
            return false;
        if (!valor) {
            errorDescripcion.textContent = 'La descripción es requerida';
            errorDescripcion.style.display = 'block';
            return false;
        }
        if (valor.length < 3) {
            errorDescripcion.textContent = 'La descripción debe tener al menos 3 letras';
            errorDescripcion.style.display = 'block';
            return false;
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
            errorDescripcion.textContent = 'Solo se permiten letras y espacios';
            errorDescripcion.style.display = 'block';
            return false;
        }
        errorDescripcion.style.display = 'none';
        return true;
    }
    validarMonto(input) {
        const errorMonto = document.getElementById('error-monto');
        const valor = input.value.trim();
        const monto = parseFloat(valor);
        if (!errorMonto)
            return false;
        if (!valor || isNaN(monto) || monto <= 0) {
            errorMonto.textContent = 'Ingrese un monto válido mayor a 0';
            errorMonto.style.display = 'block';
            return false;
        }
        errorMonto.style.display = 'none';
        return true;
    }
    validarEntrada() {
        const montoInput = document.getElementById('monto');
        const descripcionInput = document.getElementById('descripcion');
        const montoValido = this.validarMonto(montoInput);
        const descripcionValida = this.validarDescripcion(descripcionInput);
        return montoValido && descripcionValida;
    }
    procesarTransaccion(tipo) {
        if (!this.validarEntrada())
            return;
        const montoInput = document.getElementById('monto');
        const descripcionInput = document.getElementById('descripcion');
        const errorMonto = document.getElementById('error-monto');
        const monto = parseFloat(montoInput.value);
        // Validar saldo suficiente para gastos
        if (tipo === 'gasto' && monto > this.saldoActual) {
            if (errorMonto) {
                errorMonto.textContent = `Saldo insuficiente. Saldo actual: $${this.saldoActual.toFixed(2)}`;
                errorMonto.style.display = 'block';
            }
            return;
        }
        // Crear y guardar la transacción
        const transaccion = {
            descripcion: descripcionInput.value.trim(),
            monto: monto,
            tipo: tipo,
            fecha: new Date().toLocaleDateString()
        };
        this.transacciones.push(transaccion);
        this.saldoActual += tipo === 'ingreso' ? monto : -monto;
        localStorage.setItem('transacciones', JSON.stringify(this.transacciones));
        this.actualizarUI();
        this.limpiarFormulario();
    }
    actualizarUI() {
        // Actualizar balance
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = `Balance: $${this.saldoActual.toFixed(2)}`;
            balanceElement.style.color = this.saldoActual >= 0 ? '#4CAF50' : '#f44336';
        }
        // Actualizar historial
        const historialElement = document.getElementById('historial');
        if (historialElement) {
            historialElement.innerHTML = '';
            [...this.transacciones].reverse().forEach(t => {
                const div = document.createElement('div');
                div.className = `transaccion ${t.tipo}`;
                div.innerHTML = `
                    <div class="transaccion-info">
                        <strong>${t.descripcion}</strong>
                        <span class="monto">${t.tipo === 'ingreso' ? '+' : '-'}$${t.monto.toFixed(2)}</span>
                    </div>
                    <small>${t.fecha}</small>
                `;
                historialElement.appendChild(div);
            });
        }
    }
    limpiarFormulario() {
        const montoInput = document.getElementById('monto');
        const descripcionInput = document.getElementById('descripcion');
        const errorMonto = document.getElementById('error-monto');
        const errorDescripcion = document.getElementById('error-descripcion');
        montoInput.value = '';
        descripcionInput.value = '';
        if (errorMonto)
            errorMonto.style.display = 'none';
        if (errorDescripcion)
            errorDescripcion.style.display = 'none';
    }
}
// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new GestorTransacciones();
});
