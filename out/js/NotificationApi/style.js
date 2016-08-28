var style = {
  notificationContainer: {
    zIndex: "1000",
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    alignContent: "flex-start",
    position: "absolute",
    top: "0px",
    right: "0px"

  },

  notificationItem: {
    width: "250px",
    margin: "5px 10px",
    borderRadius: "5px",
    fontFamily: "Lora, serif",
    margin: "10px",
    opacity: "1"
  },

  hover: {
    opacity: "0.8",
    boxShadow: "0 0 10px 0 rgb(15, 15, 15)"
  },

  success: {
    fontFamily: "Lora, serif",
    margin: "10px",
    opacity: ".9",
    width: "250px",
    margin: "5px 10px",
    borderRadius: "5px",
    backgroundColor: "#51b46d"
  },

  error: {
    fontFamily: "Lora, serif",
    margin: "10px",
    opacity: ".93",
    width: "250px",
    margin: "5px 10px",
    borderRadius: "5px",
    backgroundColor: "#D43F3A"
  },

  info: {
    fontFamily: "Lora, serif",
    margin: "10px",
    opacity: ".9",
    width: "250px",
    margin: "5px 10px",
    borderRadius: "5px",
    backgroundColor: "#39add1"
  },

  notificationTitle: {
    color: "#000",
    fontWeight: "bold",
    fontSize: "16px",
    textAlign: "center"
  },

  notificationBody: {
    color: "#000",
    textAlign: "center"
  }

};

module.exports = style;