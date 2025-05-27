describe('Music Management Test', () => {

  beforeEach(() => {
    cy.visit('/')
  })

  it('Login as admin', () => {
    cy.get('[class="welcome"]').should('contain.text', 'WELCOME TO JUKEBOX')
    cy.get('[class="btn-large start"]').should('contain.text', 'CLICK HERE')
    cy.get('[class="btn-large start"]').should('contain.text', 'CLICK HERE').click()
    cy.url().should('include', 'login')

    cy.get('[id="email"]').type('admin@gmail.com')
    cy.get('[id="password"]').type('adminpassword')
    cy.get('[type="submit"]').should('contain.text', 'Login').click()
    cy.contains(/Login Successful!/i).should('be.visible')
    cy.url().should('include', 'admin')
  })

  it('Add new song', () => {
    cy.get('[class="welcome"]').should('contain.text', 'WELCOME TO JUKEBOX')
    cy.get('[class="btn-large start"]').should('contain.text', 'CLICK HERE')
    cy.get('[class="btn-large start"]').should('contain.text', 'CLICK HERE').click()
    cy.url().should('include', 'login')

    cy.get('[id="email"]').type('admin@gmail.com')
    cy.get('[id="password"]').type('adminpassword')
    cy.get('[type="submit"]').should('contain.text', 'Login').click()
    cy.contains(/Login Successful!/i).should('be.visible')
    cy.url().should('include', 'admin')

    cy.get('[data-test=song-management]').scrollIntoView()
    cy.contains(/Song Management/i).should('be.visible')
    cy.get('[href="#add-song-modal"]').should('contain.text', 'Add New Song').click()

    cy.contains(/Add New Song/i).should('be.visible')
    cy.get('[id="add_name"]').type('hello')
    cy.get('[data-test=add-song]').should('contain.text', 'Save').click()
  })

})