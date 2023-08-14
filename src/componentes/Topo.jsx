import React from 'react'
import style from './Topo.module.css'

function Topo() {
    return (
        <div className="principal">
            <div className={style.camadaUm}>
                <p>OLÁ, ME CHAMO <strong>JOSIVAN</strong>...</p>
            </div>
            <div className={style.divCamadaDois}>
                <div className={style.camadaDois}>
                    <p>SOU UM</p>
                </div>
                <div className={style.divCamadaDoisStrong}>
                    <div className={style.camadaDoisStrong}>
                        <p>DESENVOLVEDOR WEB</p>
                    </div>
                    <div className={style.camadaTres}>
                        <p>FRONT END</p>
                    </div>
                </div>
            </div>
            <div className={style.svg}>
                <svg xmlns="http://www.w3.org/2000/svg" width="95%" height="100%" viewBox="0 0 1368 24" fill="none">
                    <path d="M0.939331 10.9392C0.353516 11.525 0.353516 12.4748 0.939331 13.0605L10.4852 22.6065C11.071 23.1923 12.0209 23.1923 12.6066 22.6065C13.1924 22.0207 13.1924 21.0709 12.6066 20.4852L4.12134 11.9999L12.6066 3.5146C13.1924 2.92881 13.1924 1.97907 12.6066 1.39328C12.0209 0.807493 11.071 0.807493 10.4852 1.39328L0.939331 10.9392ZM1368 10.5L2 10.4999L2 13.4999L1368 13.5L1368 10.5Z" fill="black" />
                </svg>
            </div>
        </div>
    )
}

export default Topo;
