import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="erdpy",
    version="0.0.1",
    description="Elrond Smart Contracts Tools and Python SDK",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/ElrondNetwork/erdpy",
    author="Elrond Network",
    license="GPL",
    packages=setuptools.find_packages(include=["erdpy*"], exclude=["examples*"]),
    include_package_data=True,
    install_requires=[
        "toml",
    ],
    zip_safe=False,
    classifiers=[
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "License :: OSI Approved :: GNU General Public License (GPL)",
        "Operating System :: POSIX :: Linux",
        "Intended Audience :: Developers",
        "Development Status :: 3 - Alpha"
    ],
    python_requires=">=3.6"
)
