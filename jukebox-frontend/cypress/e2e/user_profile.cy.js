describe('Music Management Test', () => {

    beforeEach(() => {
        cy.visit('/')
    })

    it('Login as user', () => {
        cy.get('[class="welcome"]').should('contain.text', 'WELCOME TO JUKEBOX')
        cy.get('[class="btn-large start"]').should('contain.text', 'CLICK HERE')
        cy.get('[class="btn-large start"]').should('contain.text', 'CLICK HERE').click()
        cy.url().should('include', 'login')

        cy.get('[id="email"]').type('e2e@email.com')
        cy.get('[id="password"]').type('e2etest')
        cy.get('[type="submit"]').should('contain.text', 'Login').click()
        cy.contains(/Login Successful!/i).should('be.visible')
        cy.url().should('include', 'home')
        cy.contains(/Want to Discover New Favorites Based on Your Taste?/i).should('be.visible')
    })

    it('Navigate to the profile page', () => {
        cy.get('[class="welcome"]').should('contain.text', 'WELCOME TO JUKEBOX')
        cy.get('[class="btn-large start"]').should('contain.text', 'CLICK HERE')
        cy.get('[class="btn-large start"]').should('contain.text', 'CLICK HERE').click()
        cy.url().should('include', 'login')

        cy.get('[id="email"]').type('e2e@email.com')
        cy.get('[id="password"]').type('e2etest')
        cy.get('[type="submit"]').should('contain.text', 'Login').click()
        cy.contains(/Login Successful!/i).should('be.visible')
        cy.url().should('include', 'home')
        cy.contains(/Want to Discover New Favorites Based on Your Taste?/i).should('be.visible')

        cy.get('[class="chat-btn btn-floating btn-large pink darken-1"]').click()
        cy.url().should('include', 'profile')
    })

    it.only('Start a group chat', () => {
        cy.get('[class="welcome"]').should('contain.text', 'WELCOME TO JUKEBOX')
        cy.get('[class="btn-large start"]').should('contain.text', 'CLICK HERE')
        cy.get('[class="btn-large start"]').should('contain.text', 'CLICK HERE').click()
        cy.url().should('include', 'login')

        cy.get('[id="email"]').type('e2e@email.com')
        cy.get('[id="password"]').type('e2etest')
        cy.get('[type="submit"]').should('contain.text', 'Login').click()
        cy.contains(/Login Successful!/i).should('be.visible')
        cy.url().should('include', 'home')
        cy.contains(/Want to Discover New Favorites Based on Your Taste?/i).should('be.visible')

        cy.get('[class="chat-btn btn-floating btn-large pink darken-1"]').click()
        cy.url().should('include', 'profile')

        cy.get('[id="groupChat"]').click()
        cy.contains(/Join a Genre Room/i).should('be.visible')
        // cy.get('[id="genreSelect"]').click()
        cy.get('.div.test-select-genre').select(1).should('have.value', 'pop')


    })

})