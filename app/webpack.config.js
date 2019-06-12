const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin([{ from: "./src/index.html", to: "index.html" }]),
    new CopyWebpackPlugin([{ from: "./src/org.html", to: "org.html" }]),
    new CopyWebpackPlugin([{ from: "./src/showprojects.html", to: "showprojects.html" }]),
    new CopyWebpackPlugin([{ from: "./src/publicledger.html", to: "publicledger.html" }]),
    new CopyWebpackPlugin([{ from: "./src/user.html", to: "user.html" }]),
  ],
  devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  }
};
