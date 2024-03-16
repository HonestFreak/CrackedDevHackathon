// next.config.js

module.exports = {
  webpack: (config, { isServer }) => {
    // Add raw-loader to handle binary files
    config.module.rules.push({
      test: /\.(node)$/i,
      loader: "raw-loader",
    });

    // Add file-loader to handle other binary files
    config.module.rules.push({
      test: /\.(pdf|jpg|png|gif|svg|eot|ttf|woff|woff2)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            esModule: false,
            publicPath: '/_next',
            outputPath: 'static/images/', // Output path where the assets will be stored
            name: '[name].[ext]', // Name of the file after processing
          },
        },
      ],
    });

    return config;
  },
};
