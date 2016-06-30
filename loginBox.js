//include the import

class LoginBox extends React.Component{
  _handleSubmit(event){
    event.preventDefault();//prevents page from reloading
    let userName = this._userName;
    let password = this._password;

  }

    render(){
      return(
        <form className="login-form" onClick={this._handleSubmit.bind(this)}>
          <label><h2>Login Page</h2></label>
          <div className="login-form-fields">
            <input type="text" placeholder="Door43 Account" ref={(input)=> this._userName = input} /><br />
            <input type="password" placeholder="Password" ref={(input)=> this._password = input} /><br />
          </div>
          <div className="login-form-actions">
            <button type="submit">
            Login
            </button>
            <button type="submit">
            Create Account
            </button>
          </div>
        </form>
      );
    }
}

//write the export
