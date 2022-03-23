import replace from "@rollup/plugin-replace"
import commonjs from "@rollup/plugin-commonjs";

module.exports = {
  /**
     * @param {{ output: { esModule: boolean; }; plugins: any[]; }} config
     * @param {{ env: any; }} options
     */
  rollup(config, options) {
    config.output.esModule = true;
    config.plugins = config.plugins.map((p) =>
      p.name === "replace"
        ? replace({
            "process.env.NODE_ENV": JSON.stringify(options.env),
            preventAssignment: true,
          })
        : p
    );
    config.plugins.push(commonjs());
    return config;
  },
};
