import React from 'react'
import BookingStepper from './components/BookingStepper'

const FlightBookingDetailsPage = () => {
    return (
        <div className="w-full">
            <BookingStepper currentStep={2} />
        </div>
    )
}

export default FlightBookingDetailsPage