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

    it('View song collection', () => {
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

        cy.get('[class="carousel-trending"]').scrollTo('right')
    })

    it('View artists collection', () => {
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

        cy.get('[class="carousel-artists"]').scrollIntoView()
        cy.contains(/Popular Artists/i).should('be.visible')
        cy.get('[class="carousel-artists"]').scrollTo('right')
    })

    

})