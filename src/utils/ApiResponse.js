

class ApiResponse{
       constructor (statusCode,data,message="success"){
           this.statusCode=statusCode
           this.data=data
           this.message=message
           this.succuss=statusCode<400
       }
}

export {ApiResponse}