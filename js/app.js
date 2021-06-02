const formulario = document.querySelector('#formulario');
const listaCompras = document.querySelector('#lista-compras')

eventListeners()
function eventListeners(){
    document.addEventListener('DOMContentLoaded', pedirPresupuesto)

    formulario.addEventListener('submit', agregarCompra)
}


//Clases
class Presupuesto{
    constructor(presupuestoUsuario){
        this.presupuesto = Number(presupuestoUsuario);
        this.restante = Number(presupuestoUsuario);
        this.arregloCompras = [];
    }

    //Agregas compras al arregloCompras
    agregarCompraArreglo(objCompra){
        this.arregloCompras = [...this.arregloCompras,objCompra]
        console.log(this.arregloCompras);

    }

    //Actualizar presupuesto al agregar compras
    actualizarRestante(presupuestoTotal){
        const {presupuesto,restante} = presupuestoTotal

        const restanteCompras = this.arregloCompras.reduce((total,compra) => total + compra.costo,0);
        this.restante = this.presupuesto - restanteCompras;
    }

    //Eliminar compra
    eliminarCompra(id){
        this.arregloCompras = this.arregloCompras.filter(compra => compra.id !== id);

        this.actualizarRestante(this.arregloCompras)

    }

}

class UI{
    //Mostrar el presupuesto y gasto en el HTML
    mostrarPresupuestoRestante(cantidadPresupuesto){
        const {presupuesto} = cantidadPresupuesto;

        document.querySelector('#presupuesto').textContent = presupuesto
        document.querySelector('#restante').textContent = presupuesto
    }

    //Mostrar alertas HTML
    mostrarAlertas(mensaje,tipo){
        const divAlertas = document.createElement('div');
        divAlertas.classList.add('alert', 'text-center')
   
        if(tipo === 'error'){
            divAlertas.classList.add('alert-danger')
        }

        divAlertas.classList.add('alert-info')

        divAlertas.textContent = mensaje;
        
        document.querySelector('.col-primario').insertBefore(divAlertas,formulario)

        setTimeout(() => {
            divAlertas.remove();
        },3000)
    }

    //Mostrar la cantidad en restante
    actualizarCantidadRestanteHTML(restante){
        document.querySelector('#restante').textContent = restante
    }

    //Mostrar las compras en el HTML
    mostrarComprasHTML(arregloCompras){

        this.limpiarHTML()

        arregloCompras.forEach(compraArr => {

            const {compra,costo,id} = compraArr

            const compraItem = document.createElement('li');
            compraItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center')

            compraItem.innerHTML = `${compra}<span class="badge bg-primary rounded-pill">${costo}</span>`

            //Crear el boton para eliminar compra
            const btnEliminar = document.createElement('button');
            btnEliminar.classList.add('btn', 'btn-danger')
            btnEliminar.textContent = 'Eliminar'
            btnEliminar.dataset.id = id;
            btnEliminar.onclick = () => {
                borrarCompra(id)
            }

            listaCompras.appendChild(compraItem)
            compraItem.appendChild(btnEliminar)
        });
    }

    //Eliminar compras repetidas
    limpiarHTML(){
        while(listaCompras.firstChild){
            listaCompras.removeChild(listaCompras.firstChild)
        }
    }

    //cambiar color restante al gastar mas del 50% o 75%
    cambiarRestante(presupuestoTotal){
        const {presupuesto,restante} = presupuestoTotal;
        const restanteDiv = document.querySelector('.restante')


        if((presupuesto / 4) > restante){
            restanteDiv.classList.remove('alert-success', 'alert-warning')
            restanteDiv.classList.add('alert-danger')
        }else if((presupuesto / 2) > restante){
            restanteDiv.classList.remove('alert-success', 'alert-danger')
            restanteDiv.classList.add('alert-warning')
        }else{
            restanteDiv.classList.remove('alert-warning', 'alert-danger')
            restanteDiv.classList.add('alert-success')
        }

        //Desactivar boton agrear compra cuando el restante sea menor o igual a 0
        if(restante <= 0){
            document.querySelector('#agregar-compra').disabled = true
            ui.mostrarAlertas('Se ha agotado el restante', 'error')
        }else{
            document.querySelector('#agregar-compra').disabled = false;
        }
    }

}


const ui = new UI;
let presupuesto;

//funciones
function pedirPresupuesto(){
    const presupuestoUsuario = prompt('Ingresa tu presupuesto');
    
    if(presupuestoUsuario === null || presupuestoUsuario <= 0 || isNaN(presupuestoUsuario)){
        window.location.reload();
    }

    //Instancioamos Presupuesto
    presupuesto = new Presupuesto(presupuestoUsuario)

    //Mostramos el Presupuesto y lo restante
    ui.mostrarPresupuestoRestante(presupuesto);

}

function agregarCompra(e){
    e.preventDefault()

    const compra = document.querySelector('#compra').value;
    const costo = Number(document.querySelector('#costo').value);

    if(compra === '' || costo === ''){
        ui.mostrarAlertas('Debe agregar una compra y su costo', 'error')
        return;
    }else if(costo <= 0 || isNaN(costo)){
        ui.mostrarAlertas('El costo no es valido', 'error')
        return;
    }

    //Objeto con la compra, el gasto y el id
    const objCompra = {
        compra,
        costo,
        id:Date.now()
    }

    
    //Agregamos objCompra al arreglo arregloCompras
    presupuesto.agregarCompraArreglo(objCompra)

    ui.mostrarAlertas('Se ha agregado la compra')

    //Actualizar restante al agregar un compra
    presupuesto.actualizarRestante(presupuesto)
    
    //Actualizar la cantidad de lo restante HTML
    const {restante,arregloCompras} = presupuesto
    ui.actualizarCantidadRestanteHTML(restante)

    //Mostrar compras en el HTML
    ui.mostrarComprasHTML(arregloCompras)

    //Cambiar color restante al gastar mas del 50% o 75%
    ui.cambiarRestante(presupuesto)



    formulario.reset();
}

function borrarCompra(id){
    
    //Eliminar compras
    presupuesto.eliminarCompra(id)

    //Mostrar eliminados HTML
    const {arregloCompras,restante} = presupuesto;

    //Restaurar lo restante al eliminar compras
    ui.actualizarCantidadRestanteHTML(restante)

    //Mostramos las compras ya con las compras eliminadas.
    ui.mostrarComprasHTML(arregloCompras)

    //Cambiar color restante al eliminar compra
    ui.cambiarRestante(presupuesto);
}