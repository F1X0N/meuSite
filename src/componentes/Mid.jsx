import React from 'react'
import style from './Mid.module.css'
import Mountain from './subComponentes/Mountain.svg'

function Mid() {
  return (
    <div className="principal">
      <div className={style.textoUm}>
        <p>Trabalho com JavaScript informalmente a pouco mais de 2 anos.
            Mesmo tendo maior foco com Front, tenho também experiências 
            diárias Formalmente com Node, PHP e PostgreSQL a 6 meses e 
            contando...</p>
      </div>
      <div className={style.mountain}>
        <img src={Mountain} alt="Montanha com pássaros a voar e um avião no chão" srcset="" />
      </div>
    </div>
  )
}

export default Mid
