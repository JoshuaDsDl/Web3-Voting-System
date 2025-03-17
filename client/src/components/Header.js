import React from 'react';

function Header({ accounts, connectAccounts, isOwner, isVoter }) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            DApp de Vote
          </div>
          
          <div className="account-info">
            {accounts.length > 0 ? (
              <>
                <span className="account-address">
                  {accounts[0].substring(0, 6)}...{accounts[0].substring(accounts[0].length - 4)}
                </span>
                
                <div className="account-status">
                  {isOwner && <span className="badge owner-badge">Admin</span>}
                  {isVoter && <span className="badge voter-badge">Votant</span>}
                </div>
              </>
            ) : (
              <button className="btn" onClick={connectAccounts}>
                Connecter MetaMask
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header; 