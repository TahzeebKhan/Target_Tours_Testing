import React from 'react'
import styles from './DescriptionComponent.module.css'

const DescriptionComponent = () => {
    return (
        <div className={styles.DescriptionSection}>
            <h2 className={styles.heading}>Description</h2>
            <div className={styles.paraCont}>
                <p>Hotel size 200 rooms , Arranged over 6 floors. Barcelonia elegance with 6-star service. Simply elegant in all respects, this beautiful Parisian property offers a wonderful location that enhances your stay. Enjoy spacious rooms with great amenities and 6-star service from a superb team dedicated to making you feel like a VIP. <br />
                    The Peninsula Spa has 8 treatment rooms including couples treatment rooms. The palace's spa offers hot stone massages and treatments such as aromatherapy. Other on-site facilities include a steam room and a sauna. <br />

                    Pets. Pets stay for free (dogs and cats only, 1 total, up to 5 kg per pet. Service animals welcome <br />
                    Special check-in instructions. Front desk staff will greet guests on arrival at the property
                </p>
            </div>
            <button className={styles.seeMoreBtn}>See more</button>
        </div>
    )
}

export default DescriptionComponent
