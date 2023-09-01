import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import style from './ImagemFlutuante.module.css'; // Substitua pelo caminho correto do seu arquivo de estilo
import Relax from './subComponentes/Relax.svg'; // Substitua pelo caminho correto da imagem Relax
import ShadowFloat from './subComponentes/ShadowFloat.svg'; // Substitua pelo caminho correto da imagem ShadowFloat

const Flutuando = () => {
    const propsPessoa = useSpring({
        loop: true,
        to: [
            { transform: 'translate3d(0, -10px, 0)' },
            { transform: 'translate3d(0, 10px, 0)' },
        ],
        from: { transform: 'translate3d(0, 10px, 0)' },
        config: { duration: 3000 },
    });

    const propsSombra = useSpring({
        loop: true,
        to: [
            { width: '120%', transform: 'translateX(-10%) translateY(20px)' },
            { width: '80%', transform: 'translateX(10%) translateY(20px)' },
        ],
        from: { width: '80%', transform: 'translateX(10%) translateY(20px)' },
        config: { duration: 3000 },
    });

    return (
        <div className={style.imgRelaxin}>
            <animated.img
                className={`${style.pessoa}`}
                style={propsPessoa}
                src={Relax}
                alt="Pessoa com notebook flutuando"
            />
            <animated.img
                className={`${style.sombra}`}
                style={propsSombra}
                src={ShadowFloat}
                alt="Sombra da pessoa com notebook flutuante"
            />
        </div>
    );
};

export default Flutuando;
