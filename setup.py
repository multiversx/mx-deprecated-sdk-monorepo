import setuptools

setuptools.setup(name="erdpy",
      version="0.0.1",
      description="Elrond Smart Contracts Tools",
      url="https://github.com/ElrondNetwork/elrond-sc-tools",
      author="Elrond Network",
      license="GPL",
      packages=setuptools.find_packages(),
      install_requires=[
          "toml",
      ],
      zip_safe=False,
      python_requires=">=3.6")
