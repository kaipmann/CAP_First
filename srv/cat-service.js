// export the module as a function with service as object parameters
module.exports = (srv) => {

    //extract the entities from your project
    const {Books} = cds.entities ('bookshop')
  
    // Reduce stock of ordered books
    srv.before ('CREATE', 'Orders', async (req) => {
      const order = req.data
      // if the ordered amount is null or less than zero, return error
      if (!order.amount || order.amount <= 0)  return req.error (400, 'Order at least 1 book')
      
      // create a tx function that handles the transaction operation. 
      // This is for commit and rollback of ops
      const tx = cds.transaction(req)

      const affectedRows = await tx.run (
        UPDATE (Books)
          .set   ({ stock: {'-=': order.amount}})
          .where ({ stock: {'>=': order.amount},/*and*/ ID: order.book_ID})
      )
      if (affectedRows === 0)  req.error (409, "Sold out, sorry")
    })
  
    // Add some discount for overstocked books
    srv.after ('READ', 'Books', each => {
      if (each.stock > 111)  each.title += ' -- 11% discount!'
    })
  
  }
  