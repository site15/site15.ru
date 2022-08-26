import axios from 'axios'

describe('VersionController (e2e)', () => {
    it('Get current tag', async () => {
        const result = await axios.get(`${process.env.PROJECT_URL}/api/version`)
        expect(result.data).toMatchObject({
            tag: process.env.TAG_VERSION,
        })
    })

    it('Check current tag', async () => {
        const result = await axios.get(
            `${process.env.PROJECT_URL}/api/version/check-tag/${process.env.TAG_VERSION}`,
        )
        expect(result.data).toEqual({ message: 'OK' })
    })

    it('Error in check current tag', async () => {
        try {
            await axios.get(
                `${process.env.PROJECT_URL}/api/version/check-tag/${process.env.TAG_VERSION}_RND`,
            )
            expect(true).toEqual(false)
        } catch (err) {
            expect(err.message).toEqual('Request failed with status code 400')
        }
    })
})
