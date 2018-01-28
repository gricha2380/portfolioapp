# portfolioapp
standalone edition of asset porfolio

ROUTE 1: fetch all assets from firebase datastore called assets
    db holds: symbol, name, purchase price, quantity, brokerage, asset type, id
    save all into local object
    call function to find current market data
    when data is returned send updated data object as response to client

ROUTE 2: save snapshot
    calculate the following:
        Portfolio Value, Portfolio Gains, Portfolio Growth, 
        Crypto Value, Crypto Gains, Crypto Growth, Crypto %, 
        Stock Value, Stock Gains, Stock Growth, Stock %
    once a day, save snapshot into datastore called historic, along with day time stamp
    send response to client containing the whole list of values

ROUTE 3: add asset
    post route, take in: name, symbol, asset type, purchase price, quantity, brokerage 
    add id to object. id = current_obj.length +1
    save object to db. Send response with okay or error

ROUTE 4: edit asset populate
    query db for record information with return results for asset matching id
    respond with record name, symbol, asset type, purchase price, quantity, brokerage

Route 5: edit asset save
    request contains name, symbol, asset type, purchase price, quantity, brokerage, id
    save & override relevant db record with matching asset id
    respond with okay or error

Route 6: portfolio overview
    return list of historical snapshots


Route 7: retrieve snapshots
    return list of historical snapshots

Route 8: show stats
    server side calculation of asset values
    returns all snapshot values

Route 9: Email
    send daily portfolio snapshot

Route 10: SMS
    send daily portfolio value