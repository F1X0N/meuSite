import React from 'react'
import style from './Mid.module.css'
import Mountain from './subComponentes/Mountain.svg'
import Relax from './subComponentes/Relax.svg'
import ShadowFloat from './subComponentes/ShadowFloat.svg'
import Flutuando from './ImagemFlutuante'

function Mid() {
  return (
    <div className="principal">
      <div className={style.textoUm}>
        <p>Trabalho com JavaScript informalmente a pouco mais de 2 anos.
          Mesmo tendo maior foco com Front, tenho também experiências
          diárias Formalmente com Node, PHP e PostgreSQL a 6 meses e
          contando...</p>
      </div>
      <div className={style.divImagens}>
        <div className={style.mountain}>
          <img src={Mountain} alt="Montanha com pássaros a voar e um avião no chão" srcset="" />
          <p>O que mais me encanta no desenvolvimento de softwares são as possibilidades</p>
        </div>
        <div className={style.divRelaxin}>
          <div className={style.imgRelaxin}>
            <Flutuando/>
          </div>
          <div className={style.textRelaxin}>
            <p>Formado em Análise e Desenvolvimento de Softwares, tenho 20 anos, sou apaixonado por novos desafios e amo o que faço, a área de tecnologia é fascinante.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mid
