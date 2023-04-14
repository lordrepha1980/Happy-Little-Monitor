"use strict";

const _dirname      = process.cwd();
const Data          = require(_dirname + '/server/database/MongoDB/Data.js');
const DataClass     = new Data();

const ClassRouter   = require( _dirname + '/server/database/classRouter.js');
const mob           = new ClassRouter();



class upload extends Data { 

    
        constructor() {
            super();
        }
    
    
    
        async update( request ) {
            try {
                

                const result = await super.update( request )
                

                return result
            }
            catch (error) { 
                console.log(error)
                throw ( error )
            }
            
        }
    

    
        async findOne( request ) {
            try {
                

                const result = await super.findOne( request )

                
                return result
            }
            catch (error) { 
                console.log(error)
                throw ( error )
            }
        }
    

    
        async find( request ) {
            try {
                

                const result = await super.find( request )

                
                return result
            }
            catch (error) { 
                console.log(error)
                throw ( error )
            }
        }
    

    
        async delete( request ) {
            try {
                

                const result = await super.delete( request )

                
                return result
            }
            catch (error) { 
                console.log(error)
                throw ( error )
            }
        }
    

    
        async count( request ) {
            try {
                

                const result = await super.count( request )

                
                return result
            }
            catch (error) { 
                console.log(error)
                throw ( error )
            }
        }
    

}

module.exports = upload;