import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils'
import { Loading, Spinner } from '../common/Loading'

describe('Loading Component', () => {
    it('renders loading spinner without text by default', () => {
        const { container } = render(<Loading />)

        expect(container.querySelector('.animate-spin')).toBeInTheDocument()
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('renders loading spinner with custom text', () => {
        const customText = 'Fetching data...'
        render(<Loading text={customText} />)

        expect(screen.getByText(customText)).toBeInTheDocument()
    })

    it('applies size classes correctly', () => {
        const { container } = render(<Loading size="sm" />)

        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('h-4', 'w-4')
    })

    it('applies large size classes', () => {
        const { container } = render(<Loading size="lg" />)

        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('h-12', 'w-12')
    })
})

describe('Spinner Component', () => {
    it('renders spinner with default size', () => {
        const { container } = render(<Spinner />)

        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('h-6', 'w-6')
    })

    it('applies custom className', () => {
        const customClass = 'custom-spinner-class'
        const { container } = render(<Spinner className={customClass} />)

        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass(customClass)
    })

    it('applies small size classes', () => {
        const { container } = render(<Spinner size="sm" />)

        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toHaveClass('h-4', 'w-4')
    })
})
