describe('Create Playlist Flow_1', () => {
  it('Navigate to Song Recommendation, Add one song and Create a playlist', () => {
    cy.visit('http://localhost:3000');
    cy.wait(4000);

    cy.contains('WELCOME TO JUKEBOX').should('exist');
    cy.get('a').contains('SIGN-IN').click();
    cy.wait(4000);

    cy.url().should('include', '/login');
    cy.get('#email').type('admin@gmail.com', { delay: 200 });
    cy.get('#password').type('adminpassword', { delay: 200 });
    cy.get('button[type="submit"]').click();
    cy.wait(4000);

    cy.url().should('include', '/admin');
    cy.contains('Admin Dashboard').should('exist');
    cy.get('a').contains('SONG RECOMMENDATION').click();
    cy.wait(4000);

    cy.url().should('include', '/songrecommendation');
    cy.wait(4000);
    cy.contains('Generate New Playlist').should('exist');
    cy.get('#search-input').should('be.visible').click().type('Tot', { delay: 200 });
    cy.wait(4000);
    cy.get('#autocomplete-results').should('be.visible').within(() => {
      cy.get('li.collection-item').first().click();
    });

    cy.get('#search-input').should('have.value', 'Tot Musica');

    cy.contains('Generate New Playlist').click();
    cy.wait(4000);

    cy.get('.playlist-input').should('be.visible').type('My Test Playlist', { delay: 150 });
    cy.get('.create-playlist-btn').should('be.visible').click();

  });
});

describe('Create Playlist Flow_2', () => {
  it('Navigate to Song Recommendation, Add 3 songs and Create a playlist', () => {
    cy.visit('http://localhost:3000');
    cy.wait(4000);

    cy.contains('WELCOME TO JUKEBOX').should('exist');
    cy.get('a').contains('SIGN-IN').click();
    cy.wait(4000);

    cy.url().should('include', '/login');
    cy.get('#email').type('admin@gmail.com', { delay: 200 });
    cy.get('#password').type('adminpassword', { delay: 200 });
    cy.get('button[type="submit"]').click();
    cy.wait(4000);

    cy.url().should('include', '/admin');
    cy.contains('Admin Dashboard').should('exist');
    cy.get('a').contains('SONG RECOMMENDATION').click();
    cy.wait(4000);

    cy.url().should('include', '/songrecommendation');
    cy.wait(4000);
    cy.contains('Generate New Playlist').should('exist');

    cy.get('#search-input').should('be.visible').click().type('Tot', { delay: 200 });
    cy.wait(4000);
    cy.get('#autocomplete-results').should('be.visible').within(() => {
      cy.get('li.collection-item').first().click();
    });

    cy.get('#search-input').should('have.value', 'Tot Musica');
    cy.wait(4000);

    cy.get('#search-input').should('be.visible').click().clear().type('Comedy', { delay: 200 });
    cy.wait(4000);
    cy.get('#autocomplete-results').should('be.visible').within(() => {
      cy.get('li.collection-item').first().click();
    });

    cy.get('#search-input').should('have.value', 'Comedy');
    cy.wait(4000);

    cy.get('#search-input').should('be.visible').click().clear().type('Rain', { delay: 200 });
    cy.wait(4000);
    cy.get('#autocomplete-results').should('be.visible').within(() => {
      cy.get('li.collection-item').first().click();
    });

    cy.get('#search-input').should('have.value', 'Rain');
    cy.wait(4000);

    cy.contains('Generate New Playlist').click();
    cy.wait(4000);

    cy.get('.playlist-input').should('be.visible').type('My Test Playlist2', { delay: 150 });
    cy.get('.create-playlist-btn').should('be.visible').click();

  });
});

describe('Create Playlist Flow_2', () => {
  it('Navigate to Song Recommendation, Add 3 songs and Create a playlist', () => {
    cy.visit('http://localhost:3000');
    cy.wait(4000);

    cy.contains('WELCOME TO JUKEBOX').should('exist');
    cy.get('a').contains('SIGN-IN').click();
    cy.wait(4000);

    cy.url().should('include', '/login');
    cy.get('#email').type('admin@gmail.com', { delay: 200 });
    cy.get('#password').type('adminpassword', { delay: 200 });
    cy.get('button[type="submit"]').click();
    cy.wait(4000);

    cy.url().should('include', '/admin');
    cy.contains('Admin Dashboard').should('exist');
    cy.get('a').contains('PLAYLIST').click();
    cy.wait(4000);

    cy.url().should('include', '/playlist');
    cy.wait(4000);
    cy.contains('Live Playlist Chat').should('exist');

    cy.get('#carousel-trending')
  .contains(/^My Test Playlist$/) // exact match
  .closest('.carousel-item')
  .within(() => {
    cy.contains('Explore').click({ force: true });
  });

    cy.wait(4000);

    cy.get('#playlist-modal').should('be.visible');
    cy.get('#playlist-modal .delete-btn').should('be.visible').click();

    cy.wait(4000);

    cy.on('window:confirm', (text) => {
      expect(text).to.include('Are you sure you want to delete this playlist?');
      return true; // Click OK
    });
    cy.wait(4000);
    
    cy.on('window:alert', (text) => {
      expect(text).to.include('Playlist deleted successfully');
    });
  });
});

describe('Create Playlist Flow_2', () => {
  it('Navigate to Song Recommendation, Add 3 songs and Create a playlist', () => {
    cy.visit('http://localhost:3000');
    cy.wait(4000);

    cy.contains('WELCOME TO JUKEBOX').should('exist');
    cy.get('a').contains('SIGN-IN').click();
    cy.wait(4000);

    cy.url().should('include', '/login');
    cy.get('#email').type('admin@gmail.com', { delay: 200 });
    cy.get('#password').type('adminpassword', { delay: 200 });
    cy.get('button[type="submit"]').click();
    cy.wait(4000);

    cy.url().should('include', '/admin');
    cy.contains('Admin Dashboard').should('exist');
    cy.get('a').contains('PLAYLIST').click();
    cy.wait(4000);

    cy.url().should('include', '/playlist');
    cy.wait(4000);
    cy.contains('Live Playlist Chat').should('exist');

    cy.get('#carousel-trending')
  .contains(/^My Test Playlist$/) // exact match
  .closest('.carousel-item')
  .within(() => {
    cy.contains('Explore').click({ force: true });
  });

    cy.wait(4000);

    cy.get('#playlist-modal').should('be.visible');
    cy.get('#playlist-songs-body').find('tr').last().within(() => {
      cy.get('button.remove-button').click();
    });

    cy.wait(4000);
  });
});